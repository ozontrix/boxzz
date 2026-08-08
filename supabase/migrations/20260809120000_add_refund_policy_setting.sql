-- Add Refund Policy content setting to site_settings if it doesn't exist
INSERT INTO site_settings (key, value, type, label, description, section) 
SELECT 'refund_policy_content', '', 'textarea', 'Refund Policy Content', 'Content for the Refund Policy page', 'legal'
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'refund_policy_content');
