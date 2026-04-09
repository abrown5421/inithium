import mongoose from 'mongoose';
import { connectDB } from './db.js'; 

jest.mock('mongoose');

const mockedMongoose = mongoose as jest.Mocked<typeof mongoose>;

describe('connectDB', () => {
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null) => {
      throw new Error(`Process exited with code: ${code}`);
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    exitSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('should connect to MongoDB successfully', async () => {
    mockedMongoose.connect.mockResolvedValueOnce({} as any);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    await connectDB('mongodb://localhost:27017/test');
    expect(mockedMongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/test');
    expect(consoleSpy).toHaveBeenCalledWith('[db] MongoDB connected successfully');
  });

  it('should exit process on connection failure', async () => {
    const error = new Error('Connection failed');
    mockedMongoose.connect.mockRejectedValueOnce(error);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    await expect(connectDB('invalid-uri')).rejects.toThrow('Process exited with code: 1');
    expect(consoleErrorSpy).toHaveBeenCalledWith('[db] MongoDB connection failed:', error);
  });
});