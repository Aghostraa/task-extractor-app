// src/app/actions.ts
'use server'

import { PrismaClient } from '@prisma/client';
import { Anthropic } from '@anthropic-ai/sdk';
import { revalidatePath } from 'next/cache';
import { Task } from '@/types/index';

const prisma = new PrismaClient();

interface ExtractedTask {
  text: string;
  priority: number;
  category: string;
  dueDate?: string | null;
}

interface TaskResponse {
  success: boolean;
  tasks?: any[];
  error?: string;
}

export interface TaskActionResponse {
  success: boolean;
  task?: any;
  error?: string;
}

export async function extractAndSaveTasks(formData: FormData): Promise<TaskResponse> {
  try {
    const text = formData.get('text');
    
    if (!text || typeof text !== 'string') {
      throw new Error('No text provided');
      
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || ''
    });

    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      temperature: 0,
      messages: [{
        role: "user",
        content: `Extract actionable tasks from this text. Format each task as a JSON object with:
        - text: The clear, actionable task description
        - priority: 1 (high), 2 (medium), or 3 (low) based on urgency/importance
        - category: "project", "meeting", "deadline", or "general"
        - dueDate: ISO date string if mentioned, null if not

        Return as a JSON array. Only include clear, actionable items.
        
        Text to analyze: ${text}`
      }]
    });

    // Safely extract text content from the message
    const textContent = message.content
      .filter((block): block is { type: 'text'; text: string } => 
        block.type === 'text')
      .map(block => block.text)
      .join('');

    const jsonMatch = textContent.match(/\[\s*\{[^]*\}\s*\]/);
    
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const extractedTasks = JSON.parse(jsonMatch[0]) as ExtractedTask[];
    
    // Validate and transform the tasks
    const validTasks = extractedTasks.map(task => ({
      text: task.text,
      priority: task.priority,
      category: task.category,
      sourceText: text,
      completed: false,
      flagged: false,
      status: 'todo',
      folderId: null // Default to no folder
    }));

    // Save tasks to database
    const createdTasks = await prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>) => {
      await tx.task.createMany({ data: validTasks });
      return tx.task.findMany({
        where: { sourceText: text },
        include: { folder: true },
        orderBy: { createdAt: 'desc' },
        take: validTasks.length
      });
     });

    return { success: true, tasks: createdTasks };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function getTasks() {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        folder: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return tasks;
  } catch (error) {
    console.error('Get tasks error:', error);
    return [];
  }
}

export async function completeTask(formData: FormData): Promise<TaskActionResponse> {
  try {
    const taskId = formData.get('taskId');
    
    if (!taskId || typeof taskId !== 'string') {
      throw new Error('Invalid task ID');
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { 
        completed: true,
        status: 'done' // Add this line
      }
    });
    
    revalidatePath('/');
    return { success: true, task };
  } catch (error) {
    return { success: false, error: 'Failed to complete task' };
  }
}

export async function toggleTaskFlag(formData: FormData): Promise<TaskActionResponse> {
  try {
    const taskId = formData.get('taskId');
    
    if (!taskId || typeof taskId !== 'string') {
      throw new Error('Invalid task ID');
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { flagged: !task?.flagged }
    });
    
    revalidatePath('/');
    return { success: true, task: updatedTask };
  } catch (error) {
    return { success: false, error: 'Failed to toggle flag' };
  }
}

export async function deleteTask(formData: FormData): Promise<TaskActionResponse> {
  try {
    const taskId = formData.get('taskId');
    
    if (!taskId || typeof taskId !== 'string') {
      throw new Error('Invalid task ID');
    }

    await prisma.task.delete({ where: { id: taskId } });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete task' };
  }
}

export async function updateTaskStatus(formData: FormData): Promise<TaskActionResponse> {
  try {
    const taskId = formData.get('taskId');
    const status = formData.get('status');
    
    if (!taskId || typeof taskId !== 'string' || !status || typeof status !== 'string') {
      throw new Error('Invalid task ID or status');
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { status: status as Task['status'] },
      include: { folder: true }
    });
    
    revalidatePath('/');
    return { success: true, task };
  } catch (error) {
    return { success: false, error: 'Failed to update task status' };
  }
}