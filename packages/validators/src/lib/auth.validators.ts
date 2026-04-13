import z from 'zod';

const registerBodySchema = z.object({
  email:      z.string().email(),
  password:   z.string().min(8),
  first_name: z.string().min(1),
  last_name:  z.string().min(1),
});

export const authValidators = {
  login:    z.object({ body: z.object({ email: z.string().email(), password: z.string().min(8) }) }),
  register: z.object({ body: registerBodySchema }),
  refresh:  z.object({ body: z.object({ refreshToken: z.string() }) }),
};

export type RegisterBody = z.infer<typeof registerBodySchema>;
