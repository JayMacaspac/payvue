/*
  # Create bills table for bill tracking app

  1. New Tables
    - `bills`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text, bill name)
      - `amount` (numeric, bill amount)
      - `category` (text, bill category)
      - `due_date` (date, when bill is due)
      - `is_paid` (boolean, payment status)
      - `is_recurring` (boolean, if bill repeats)
      - `frequency` (text, how often it repeats)
      - `description` (text, optional notes)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `bills` table
    - Add policies for authenticated users to manage their own bills
*/

CREATE TABLE IF NOT EXISTS bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'other',
  due_date date NOT NULL,
  is_paid boolean DEFAULT false,
  is_recurring boolean DEFAULT true,
  frequency text DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'yearly', 'quarterly')),
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own bills"
  ON bills
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bills"
  ON bills
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bills"
  ON bills
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bills"
  ON bills
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS bills_user_id_idx ON bills(user_id);
CREATE INDEX IF NOT EXISTS bills_due_date_idx ON bills(due_date);
CREATE INDEX IF NOT EXISTS bills_category_idx ON bills(category);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_bills_updated_at
  BEFORE UPDATE ON bills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();