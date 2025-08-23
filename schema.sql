-- Create partners table
CREATE TABLE IF NOT EXISTS partners (
  id VARCHAR(4) PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL
);

-- Create requests table
CREATE TABLE IF NOT EXISTS requests (
  id VARCHAR PRIMARY KEY DEFAULT (gen_random_uuid()),
  partner_id VARCHAR(4) NOT NULL REFERENCES partners(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_contact TEXT NOT NULL,
  request_type TEXT NOT NULL,
  urgency TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Insert sample partner data (one at a time to avoid conflicts)
INSERT INTO partners (id, full_name, email, phone) VALUES ('1234', 'Sarah Johnson', 'sarah.johnson@example.com', '(555) 123-4567');
INSERT INTO partners (id, full_name, email, phone) VALUES ('5678', 'Michael Chen', 'michael.chen@example.com', '(555) 987-6543');
INSERT INTO partners (id, full_name, email, phone) VALUES ('9876', 'Emma Rodriguez', 'emma.rodriguez@example.com', '(555) 456-7890');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_requests_partner_id ON requests(partner_id);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at);

