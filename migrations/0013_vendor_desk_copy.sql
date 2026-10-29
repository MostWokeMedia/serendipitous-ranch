-- Ranch-desk vendor wording, so a fresh database keeps what was saved.

update page_panels
set fields = $points${"kicker":"","title":"","body":"","note":"","items":[{"stat":"","title":"Vendors Keep Everything","text":"We don't charge to apply, don't charge to list, and we never take a cut of your sales. We send qualified clients your way because a full-paying vendor is better for everyone than a discounted one."},{"stat":"","title":"City Reach Without City Rent","text":"Serendipitous Ranch sits 15 minutes from downtown Austin — near enough that you don't think twice about the drive, far enough that you're not paying downtown prices for the same crowd."},{"stat":"","title":"See It Before You Build It","text":"We don't hand you a diagram and wish you luck. We walk the property with you, mark your boundaries, show you the outlets, and answer the questions you didn't know you had."}]}$points$
where id = 'vendors-points';

update page_panels
set fields = $apply${"kicker":"","title":"Apply Below","body":"The ranch desk reads this. It is how we call you back. It is not posted as a public directory.","note":"","items":[]}$apply$
where id = 'vendors-apply';

update page_panels
set fields = $faq${"kicker":"","title":"Vendor questions","body":"","note":"","items":[{"stat":"","title":"Is the list exclusive?","text":"No. Our vendor list is a recommendation, not a requirement. Clients are free to use their own licensed and insured vendors. We don’t lock them in to protect a referral cut — the goal is the best event, not the biggest fee."},{"stat":"","title":"Is there a fee or a cut?","text":"Nothing to apply. Nothing to stay listed. Nothing taken from your invoice. The client hires you. We are the land. If we recommend you, it's because we think you're right for the client."},{"stat":"","title":"Do I need insurance to apply?","text":"Say whether you carry it. Before you work a date, yes: liability, and whatever license Texas already requires for your trade. — TABC certification for bar service, Part 107 for drone operators. We'll confirm specifics with you before your first event."},{"stat":"","title":"How much work is this?","text":"We do not promise a season. Some years are a handful of weddings, offsites, and retreats."},{"stat":"","title":"Do you provide day-of coordination?","text":"If the booking includes coordination, we keep load-in, power, and the noise window straight. We do not replace your planner, and we do not become your employer."}]}$faq$
where id = 'vendors-faq';
