export type Testimonial = {
  body: string
  saidBy: string
}

export const PLACEHOLDER_TESTIMONIALS: Testimonial[] = [
  {
    body: 'Patients who struggled to stay engaged in traditional rehab are asking for longer sessions. The immersion changes the entire dynamic of therapy.',
    saidBy: 'Dr. Elena Vasquez, Physical Medicine',
  },
  {
    body: 'We cut our average setup time dramatically. Clinicians spend less time configuring equipment and more time guiding recovery.',
    saidBy: 'Marcus Okonkwo, Clinic Director',
  },
  {
    body: 'The feedback loops feel immediate and motivating. I finally have a tool that makes progress visible to both patient and therapist.',
    saidBy: 'Priya Nair, Occupational Therapist',
  },
  {
    body: 'Our pilot cohort showed stronger adherence week over week. That consistency is what we have been chasing for years.',
    saidBy: 'Dr. Tomas Bergström, Neurorehab Lead',
  },
]
