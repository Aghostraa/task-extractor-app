// src/app/actions.ts
'use server'

import { PrismaClient } from '@prisma/client';
import { Anthropic } from '@anthropic-ai/sdk';
import { revalidatePath } from 'next/cache';

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

interface TaskActionResponse {
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
      flagged: false
    }));

    // Save tasks to database
    await prisma.task.createMany({
      data: validTasks
    });

    // Fetch created tasks
    const createdTasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
      take: validTasks.length
    });

    revalidatePath('/');
    return { success: true, tasks: createdTasks };
  } catch (error) {
    console.error('Task extraction error:', error);
    return { success: false, error: 'Failed to process tasks' };
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
      data: { completed: true }
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