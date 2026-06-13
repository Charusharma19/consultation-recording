import { Response } from 'express';
import { Client } from '../models/Client';
import { Recording } from '../models/Recording';
import { AuthRequest } from '../middleware/auth';

export const getClients = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const clients = await Client.find({ user: req.user.id }).sort({ name: 1 });
    res.status(200).json(clients);
  } catch (error) {
    console.error('Fetch clients error:', error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
};

export const createClient = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const { name, email, phone, notes } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Client name is required.' });
    }

    const client = new Client({
      name,
      email,
      phone,
      notes,
      user: req.user.id,
    });

    await client.save();
    res.status(201).json(client);
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
};

export const getClientById = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const client = await Client.findOne({ _id: req.params.id, user: req.user.id });
    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }

    const recordings = await Recording.find({ client: client._id, user: req.user.id })
      .sort({ date: -1 });

    res.status(200).json({
      client,
      recordings,
    });
  } catch (error) {
    console.error('Fetch client details error:', error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
};
