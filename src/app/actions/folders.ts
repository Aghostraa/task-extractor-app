// src/app/actions/folders.ts
'use server'

import { revalidatePath } from 'next/cache';
import { FolderActionResponse } from '@/types';
import prisma from '@/lib/prisma';  // Make sure this import is correct
import { TaskActionResponse } from '@/app/actions/tasks';

export async function getFolders() {
  try {
    // Verify prisma is available
    if (!prisma) {
      console.error('Prisma client is not initialized');
      return [];
    }

    const folders = await prisma.folder.findMany({
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return folders;
  } catch (error) {
    console.error('Get folders error:', error);
    return [];
  }
}

export async function createFolder(formData: FormData): Promise<FolderActionResponse> {
  try {
    const name = formData.get('name');
    const description = formData.get('description') || undefined;
    const color = formData.get('color') || undefined;

    if (!name || typeof name !== 'string') {
      return { success: false, error: 'Folder name is required' };
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        description: typeof description === 'string' ? description : undefined,
        color: typeof color === 'string' ? color : undefined,
      },
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    });

    revalidatePath('/');
    return { success: true, folder };
  } catch (error) {
    console.error('Create folder error:', error);
    return { success: false, error: 'Failed to create folder' };
  }
}

export async function updateFolder(formData: FormData): Promise<FolderActionResponse> {
  try {
    const id = formData.get('id');
    const name = formData.get('name');
    const description = formData.get('description');
    const color = formData.get('color');

    if (!id || typeof id !== 'string') {
      return { success: false, error: 'Folder ID is required' };
    }

    const folder = await prisma.folder.update({
      where: { id },
      data: {
        name: typeof name === 'string' ? name : undefined,
        description: typeof description === 'string' ? description : undefined,
        color: typeof color === 'string' ? color : undefined,
      },
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    });

    revalidatePath('/');
    return { success: true, folder };
  } catch (error) {
    console.error('Update folder error:', error);
    return { success: false, error: 'Failed to update folder' };
  }
}

export async function deleteFolder(formData: FormData): Promise<FolderActionResponse> {
  try {
    const id = formData.get('id');

    if (!id || typeof id !== 'string') {
      return { success: false, error: 'Folder ID is required' };
    }

    // First update all tasks in the folder to remove the folder ID
    await prisma.task.updateMany({
      where: { folderId: id },
      data: { folderId: null }
    });

    // Then delete the folder
    await prisma.folder.delete({
      where: { id },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Delete folder error:', error);
    return { success: false, error: 'Failed to delete folder' };
  }
}

export async function assignTaskToFolder(formData: FormData): Promise<TaskActionResponse> {
  try {
    const taskId = formData.get('taskId');
    const folderId = formData.get('folderId');

    if (!taskId || typeof taskId !== 'string') {
      return { success: false, error: 'Invalid task ID' };
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { folderId: folderId ? String(folderId) : null },
      include: { folder: true }
    });

    return { success: true, task };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
