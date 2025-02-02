import { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from 'lib/api'
import { PlatformAuthClient } from 'lib/api/auth'

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req
  const { ref, id } = req.query

  if (!ref || !id) {
    return res.status(400).json({ error: 'Missing required parameters' })
  }

  const authClient = new PlatformAuthClient(req)

  switch (method) {
    case 'DELETE':
      try {
        const response = await authClient.deleteUser(ref as string, id as string)
        return res.status(200).json(response)
      } catch (error: any) {
        return res.status(error?.status || 500).json({ error: error?.message || 'An unexpected error occurred' })
      }
    default:
      res.setHeader('Allow', ['DELETE'])
      res.status(405).json({ error: `Method ${method} Not Allowed` })
  }
})
