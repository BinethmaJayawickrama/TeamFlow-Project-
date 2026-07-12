const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean database
  await prisma.activityLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.attachment.deleteMany({});
  await prisma.taskComment.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  // Hash passwords
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const pmPassword = await bcrypt.hash('pm123', salt);
  const memberPassword = await bcrypt.hash('member123', salt);

  // Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@teamflow.com',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: 'ADMIN',
    },
  });

  const pm = await prisma.user.create({
    data: {
      email: 'pm@teamflow.com',
      password: pmPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'PROJECT_MANAGER',
    },
  });

  const member = await prisma.user.create({
    data: {
      email: 'member@teamflow.com',
      password: memberPassword,
      firstName: 'Alice',
      lastName: 'Smith',
      role: 'TEAM_MEMBER',
    },
  });

  console.log('Created Users:', {
    admin: admin.email,
    pm: pm.email,
    member: member.email,
  });

  // Create a Sample Project
  const project = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Redesign the company website to improve user engagement and support mobile users.',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'ACTIVE',
      creatorId: pm.id,
    },
  });

  console.log('Created Project:', project.name);

  // Assign PM and Member to Project
  await prisma.projectMember.createMany({
    data: [
      { projectId: project.id, userId: pm.id },
      { projectId: project.id, userId: member.id },
    ],
  });

  // Create Sample Tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Design Homepage Mockups',
      description: 'Create high-fidelity wireframes and visual designs for the main landing page.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      projectId: project.id,
      assigneeId: member.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Setup Express API & Prisma',
      description: 'Build the server scaffolding, connect SQLite, write database models.',
      priority: 'HIGH',
      status: 'COMPLETED',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      projectId: project.id,
      assigneeId: pm.id,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Setup Authentication Views',
      description: 'Write frontend forms for Login, Registration, and Password resets.',
      priority: 'MEDIUM',
      status: 'TODO',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      projectId: project.id,
      assigneeId: member.id,
    },
  });

  console.log('Created Tasks:', [task1.title, task2.title, task3.title]);

  // Create Task Comments
  await prisma.taskComment.create({
    data: {
      content: 'I have started on the homepage layouts, using standard slate colors.',
      taskId: task1.id,
      userId: member.id,
    },
  });

  await prisma.taskComment.create({
    data: {
      content: 'Excellent, make sure to add dark mode gradients to the layout!',
      taskId: task1.id,
      userId: pm.id,
    },
  });

  // Create Activity Logs
  await prisma.activityLog.createMany({
    data: [
      { action: `Project Manager John Doe created project "${project.name}"`, userId: pm.id },
      { action: `John Doe added Alice Smith to project "${project.name}"`, userId: pm.id },
      { action: `John Doe assigned task "${task1.title}" to Alice Smith`, userId: pm.id },
      { action: `Alice Smith started working on task "${task1.title}"`, userId: member.id },
    ],
  });

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
