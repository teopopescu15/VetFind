-- App no longer uses appointment status 'expired'. Legacy rows become 'completed'.
UPDATE appointments
SET status = 'completed', updated_at = NOW()
WHERE status::text = 'expired';
