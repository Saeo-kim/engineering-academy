// Project Structure & File Literacy.
// A course track in the same shape as Robotics Engineering: modules, lessons,
// and stages. Each lesson answers the six questions in helpers.js.
import { MODULE_01, MODULE_02 } from './modules-1-2.js';
import { MODULE_03, MODULE_04 } from './modules-3-4.js';
import { MODULE_05, MODULE_06 } from './modules-5-6.js';
import { MODULE_07 } from './modules-7.js';

export const PROJECT_STRUCTURE = {
  id: 'project-structure',
  title: 'Project Structure & File Literacy',
  tagline: 'How to open an unfamiliar project without getting lost',
  level: 'Beginner to intermediate',
  description:
    'Learn why software projects are split into these folders and files, what each name means, and how the different parts work together. By the end of this course you can open a Spring Boot project you have never seen, read its structure, and explain each file\'s responsibility and how a request flows through it.',
  prerequisites: [
    'You should be able to create and open files and folders on your computer.',
    'No programming experience is needed. Code is read step by step, starting with how to read it.',
    'Module 7 works best if you have a GitHub account and Git installed.',
  ],
  outcomes: [
    'Read the folder structure of a project you have never seen, and explain the role of each folder.',
    'Guess what a file is for from its extension and path, then confirm it.',
    'Tell apart configuration files, environment variables, and development and production settings.',
    'Explain the roles of Controller, Service, Repository, Entity, and DTO, and how they connect.',
    'Follow a browser request through the backend and back to the screen.',
    'Read a real repository and draw a project structure map.',
  ],
  stages: [
    { id: 'anatomy', label: 'Foundations', modules: ['anatomy', 'folder-roles', 'file-types'] },
    { id: 'config', label: 'Configuration', modules: ['configuration'] },
    { id: 'architecture', label: 'Architecture', modules: ['backend', 'frontend'] },
    { id: 'lab', label: 'Practice', modules: ['reading-lab'] },
  ],
  modules: [MODULE_01, MODULE_02, MODULE_03, MODULE_04, MODULE_05, MODULE_06, MODULE_07],
};
