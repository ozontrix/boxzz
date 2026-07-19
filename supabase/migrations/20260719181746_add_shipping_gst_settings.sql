-- Add shipping and GST settings to site_settings if they don't exist
INSERT INTO site_settings (key, value, type, label, description, section) 
SELECT 'free_shipping_threshold', '499', 'number', 'Free Shipping Threshold (₹)', 'Orders above this amount get free shipping', 'shipping'
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'free_shipping_threshold');

INSERT INTO site_settings (key, value, type, label, description, section) 
SELECT 'standard_shipping_charge', '75', 'number', 'Standard Shipping Charge (₹)', 'Default shipping rate for orders below threshold', 'shipping'
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'standard_shipping_charge');

INSERT INTO site_settings (key, value, type, label, description, section) 
SELECT 'gst_rate', '0.12', 'number', 'GST Rate (decimal)', 'GST rate applied to subtotal (e.g. 0.12 = 12%)', 'shipping'
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'gst_rate');

-- Add shipping section to the section config
-- Ensure privacy_policy, terms_conditions, shipping_policy content settings
INSERT INTO site_settings (key, value, type, label, description, section) 
SELECT 'privacy_policy_content', '', 'textarea', 'Privacy Policy Content', 'Content for the Privacy Policy page', 'legal'
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'privacy_policy_content');

INSERT INTO site_settings (key, value, type, label, description, section) 
SELECT 'terms_conditions_content', '', 'textarea', 'Terms & Conditions Content', 'Content for the Terms & Conditions page', 'legal'
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'terms_conditions_content');

INSERT INTO site_settings (key, value, type, label, description, section) 
SELECT 'shipping_policy_content', '', 'textarea', 'Shipping Policy Content', 'Content for the Shipping Policy page', 'legal'
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'shipping_policy_content');