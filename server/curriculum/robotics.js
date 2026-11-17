// Robotics Engineering learning track.
//
// Curriculum content lives in code (it ships with the app and is versioned in
// Git). Your own progress, attached lecture videos and saved notes live in the
// database (see server/courses.js), so editing this file never loses progress
// as long as lesson ids stay the same. Never rename a lesson id.
//
// Lesson fields:
//   id          stable, unique within the track
//   minutes     estimated study time, excluding the video
//   summary     one-paragraph answer to "what is this?"
//   why         why it matters to a robotics engineer
//   objectives  what you can do after the lesson
//   sections    the lesson body: [{ heading, body }]
//   keyTerms    [term, definition] pairs
//   example     a real-world example
//   practice    a hands-on exercise
//   videoQuery  search terms used by "Find lecture videos"

export const ROBOTICS = {
  id: 'robotics',
  title: 'Robotics Engineering',
  tagline: 'From your first motor to autonomous, safe, intelligent robots.',
  description:
    'A complete, beginner-friendly path through robotics engineering. Start with what a robot is and how it moves, wire up electronics and sensors, program real control loops, then add AI, autonomy, human-robot interaction and safety engineering. Every module ends with a practical build, and the track finishes with capstone projects you can show to an employer.',
  level: 'Beginner to advanced',
  prerequisites: [
    'High-school algebra and basic trigonometry (sine, cosine, angles).',
    'Comfort using a computer and installing software. No prior programming is required; Module 5 teaches what you need.',
    'Optional for the hands-on builds: an Arduino-compatible board, a small two-wheel robot kit, and a multimeter.',
  ],
  outcomes: [
    'Explain how any robot senses, decides and acts, and name the engineering discipline behind each part.',
    'Select motors, gears, batteries, drivers and sensors for a given task and justify the choice with numbers.',
    'Write and tune closed-loop control code, including PID, on a microcontroller.',
    'Build ROS 2 software, test it in simulation, and run localization, mapping and path planning.',
    'Apply machine learning and computer vision to robot perception and decision-making.',
    'Design robots that people can work alongside safely, using risk assessment and the relevant international standards.',
  ],
  stages: [
    { id: 'foundations', label: 'Foundations', modules: ['fundamentals', 'mechanical', 'electronics'] },
    { id: 'core', label: 'Core skills', modules: ['sensors', 'programming', 'control'] },
    { id: 'advanced', label: 'Advanced', modules: ['ai', 'autonomy', 'hri', 'safety'] },
    { id: 'capstone', label: 'Capstone', modules: ['capstone'] },
  ],
  modules: [
    // ───────────────────────────────────────────── Module 1
    {
      id: 'fundamentals',
      title: 'Robot Fundamentals',
      level: 'Beginner',
      summary: 'What a robot is, the main families of robots, and the vocabulary engineers use to describe how they move.',
      objectives: [
        'Define a robot and describe the sense–think–act cycle.',
        'Classify robots by structure and application.',
        'Describe a robot using degrees of freedom, workspace and coordinate frames.',
      ],
      lessons: [
        {
          id: 'what-is-a-robot',
          title: 'What is a robot?',
          minutes: 15,
          summary:
            'A robot is a machine that senses its environment, decides what to do, and acts on the physical world, with some degree of autonomy. That sense–think–act loop is what separates a robot from a simple machine such as a washing machine timer or a remote-controlled toy.',
          why: 'Every later topic in this track maps onto one part of the sense–think–act loop. Seeing a robot as that loop lets you break any system, however complex, into parts you can design and debug one at a time.',
          objectives: ['Define a robot in your own words.', 'Identify the sense, think and act parts of a real robot.', 'Distinguish autonomous, semi-autonomous and teleoperated systems.'],
          sections: [
            {
              heading: 'The sense–think–act loop',
              body: 'Sensors measure the world (distance, light, position, force). A controller, usually a computer program, turns those measurements into decisions. Actuators such as motors turn decisions into motion or force. The loop repeats many times per second, so the robot can react to change.',
            },
            {
              heading: 'Levels of autonomy',
              body: 'A teleoperated robot is driven by a person through a remote link, for example a bomb-disposal robot. A semi-autonomous robot handles low-level tasks itself (balancing, avoiding obstacles) while a human sets goals. A fully autonomous robot plans and completes tasks with no human input during operation. Most real systems sit somewhere in between.',
            },
            {
              heading: 'Robotics is a team discipline',
              body: 'Mechanical engineering gives the robot its body, electrical engineering powers and connects it, computer science gives it behaviour, and control theory keeps it stable. A robotics engineer understands all four well enough to make good trade-offs between them.',
            },
          ],
          keyTerms: [
            ['Sensor', 'A device that converts a physical quantity into a signal the controller can read.'],
            ['Actuator', 'A device that converts a control signal into motion or force, such as a motor.'],
            ['Controller', 'The hardware and software that decides what the actuators should do.'],
            ['Autonomy', 'The degree to which a robot operates without human input.'],
          ],
          example:
            'A robot vacuum cleaner senses walls with bump and infrared sensors, decides on a cleaning path in software, and acts through two drive motors and a brush motor. It is semi-autonomous: you choose when and which rooms to clean, and it handles the rest.',
          practice:
            'Pick three machines in your home (for example a thermostat, a robot vacuum and a microwave). For each, write down what it senses, how it decides, and how it acts. Decide which ones you would call a robot and why.',
          videoQuery: 'what is a robot sense think act introduction to robotics lecture',
        },
        {
          id: 'types-of-robots',
          title: 'Types and applications of robots',
          minutes: 15,
          summary:
            'Robots are grouped by their physical structure (arms, wheeled and legged mobile robots, aerial and underwater vehicles, humanoids) and by where they work (industry, logistics, medicine, homes, exploration).',
          why: 'Choosing the right type of robot for a task is the first and most expensive design decision. A wheeled base cannot climb stairs, and an arm bolted to the floor cannot fetch parts from another room.',
          objectives: ['Name the main structural families of robots.', 'Match a robot type to a real application.', 'Describe the strengths and limits of each family.'],
          sections: [
            {
              heading: 'Manipulators',
              body: 'Robot arms (manipulators) are chains of rigid links connected by joints. Common industrial types are articulated arms with six rotating joints, SCARA arms for fast horizontal pick-and-place, Cartesian (gantry) robots that move along straight X, Y and Z axes, and parallel (delta) robots for very fast, light picking.',
            },
            {
              heading: 'Mobile robots',
              body: 'Wheeled robots are efficient on flat ground. Tracked robots handle rough terrain. Legged robots, with two, four or six legs, can step over obstacles but are harder to control. Aerial drones and underwater vehicles move in three dimensions and must manage energy carefully.',
            },
            {
              heading: 'Applications',
              body: 'Industrial robots weld, paint and assemble. Autonomous mobile robots (AMRs) move goods in warehouses. Surgical robots let surgeons operate through small incisions with scaled, tremor-free motion. Service robots clean, deliver and guide. Field robots inspect pipelines, farms, mines and other planets.',
            },
          ],
          keyTerms: [
            ['Manipulator', 'A robot arm built from links and joints that positions a tool.'],
            ['SCARA', 'Selective Compliance Assembly Robot Arm: stiff vertically, compliant horizontally, ideal for fast pick-and-place.'],
            ['AMR', 'Autonomous mobile robot: navigates on its own using onboard sensors and maps.'],
            ['Humanoid', 'A robot with a human-like body plan, designed to work in spaces built for people.'],
          ],
          example:
            'A modern warehouse may combine fixed articulated arms that pick items from bins, AMRs that bring shelves to the pickers, and a gantry robot that palletises boxes, each chosen for what it does best.',
          practice:
            'Choose an industry you find interesting (food, healthcare, construction, logistics). List two tasks in it that a robot could do and recommend a robot type for each, with one sentence of justification.',
          videoQuery: 'types of robots industrial mobile manipulator SCARA delta explained',
        },
        {
          id: 'anatomy-of-a-robot',
          title: 'Anatomy of a robot',
          minutes: 20,
          summary:
            'Every robot is built from the same subsystems: a mechanical structure, actuators and transmissions, sensors, a power system, a computing and control system, and an interface for people or other machines.',
          why: 'When a robot misbehaves, the fault is in one of these subsystems or in the connection between two of them. Knowing the anatomy turns "it does not work" into a short list of things to check.',
          objectives: ['List the six main subsystems of a robot.', 'Trace a command from software to motion.', 'Explain how subsystems depend on each other.'],
          sections: [
            {
              heading: 'The six subsystems',
              body: 'Structure: frame, links and joints. Actuation: motors plus gears, belts or screws. Sensing: internal sensors (encoders, IMUs) and external sensors (cameras, distance sensors). Power: batteries or mains supply, regulators and protection. Computing: microcontrollers for real-time tasks and computers for heavy processing. Interface: buttons, screens, networks and safety controls.',
            },
            {
              heading: 'Following a command',
              body: 'Suppose the software decides to drive forward. The computer sends a speed target to a microcontroller, which outputs a PWM signal to a motor driver. The driver switches battery current through the motor, the motor turns a gearbox, and the wheel moves. An encoder on the motor reports back how far it really turned, closing the loop.',
            },
          ],
          keyTerms: [
            ['End effector', 'The tool at the end of a robot arm: a gripper, suction cup, welding torch or camera.'],
            ['Transmission', 'Gears, belts, chains or screws that change the speed and torque between motor and joint.'],
            ['Encoder', 'A sensor that measures rotation of a shaft.'],
            ['Embedded system', 'A small computer built into a device to control it in real time.'],
          ],
          example:
            'A desktop robot arm used in classrooms contains an aluminium and plastic structure, stepper motors with belt drives, limit switches for homing, a 12 V power supply, a microcontroller board running firmware, and a USB link to a PC application.',
          practice:
            'Find a photo or teardown video of any robot. Label as many parts as you can and assign each to one of the six subsystems. Note one place where two subsystems meet, such as a motor connector.',
          videoQuery: 'robot components anatomy actuators sensors controller power explained',
        },
        {
          id: 'dof-workspace-frames',
          title: 'Degrees of freedom, workspace and coordinate frames',
          minutes: 25,
          summary:
            'Degrees of freedom (DOF) count the independent ways a robot can move. The workspace is the set of points it can reach. Coordinate frames are the reference systems used to describe where things are.',
          why: 'These three ideas are the shared language of robotics. A specification sheet, a ROS configuration file and a kinematics equation all describe robots in terms of DOF, reach and frames.',
          objectives: ['Count the degrees of freedom of a mechanism.', 'Sketch the workspace of a simple arm.', 'Describe a position and orientation relative to a frame.'],
          sections: [
            {
              heading: 'Degrees of freedom',
              body: 'An object free in space has six DOF: three translations (x, y, z) and three rotations (roll, pitch, yaw). A robot arm needs six joints to place its tool at any position with any orientation within its reach. A car-like robot on the floor moves in three DOF (x, y and heading), even though it cannot slide sideways.',
            },
            {
              heading: 'Workspace',
              body: 'The reachable workspace is every point the tool can touch. The dexterous workspace is the smaller region where it can arrive with any orientation. Joint limits, link lengths and self-collision shape both. Engineers check that every task point lies comfortably inside the workspace, not at its edge.',
            },
            {
              heading: 'Coordinate frames',
              body: 'A frame is an origin plus three perpendicular axes. Robots use many: a world frame, a base frame, one per link, a tool frame and a camera frame. A pose combines a position and an orientation. Converting a point from one frame to another is called a transformation, and ROS keeps track of them with a tool called tf2.',
            },
          ],
          keyTerms: [
            ['Degree of freedom (DOF)', 'One independent direction of motion: a translation or a rotation.'],
            ['Pose', 'Position plus orientation of an object relative to a frame.'],
            ['Workspace', 'The region a robot\'s end effector can reach.'],
            ['Right-hand rule', 'Convention for axis directions: fingers curl from x to y, thumb points along z.'],
          ],
          example:
            'A six-axis industrial arm has a reach of about 900 mm. To weld a seam, engineers place the part so the whole seam lies in the dexterous workspace, letting the torch hold the correct angle along the entire path.',
          practice:
            'Count the DOF of your own arm from shoulder to wrist (hint: shoulder 3, elbow 1, forearm and wrist 3). Then draw a two-link planar arm with links of 10 cm and 6 cm and sketch its reachable workspace as a ring.',
          videoQuery: 'degrees of freedom robot workspace coordinate frames pose robotics lecture',
        },
      ],
      project: {
        title: 'Robot teardown report',
        description:
          'Analyse one real robot (a kit, a robot vacuum, or a well-documented commercial robot) and write a one-page technical profile of it.',
        deliverables: [
          'Its type, application and level of autonomy.',
          'A labelled diagram of its six subsystems.',
          'Its degrees of freedom and an estimate of its workspace.',
          'Three design trade-offs you think the engineers made.',
        ],
      },
    },
    // ───────────────────────────────────────────── Module 2
    {
      id: 'mechanical',
      title: 'Mechanical Systems',
      level: 'Beginner',
      summary: 'How robots are built and how they move: links and joints, motors, gears, kinematics and end effectors.',
      objectives: [
        'Describe joints and kinematic chains.',
        'Choose a motor and gear ratio from torque and speed requirements.',
        'Compute the forward kinematics of a planar arm.',
      ],
      lessons: [
        {
          id: 'links-joints',
          title: 'Links, joints and kinematic chains',
          minutes: 20,
          summary:
            'A robot mechanism is a chain of rigid bodies (links) connected by joints that allow specific motions. Revolute joints rotate, prismatic joints slide, and their arrangement determines what the robot can do.',
          why: 'The joint layout fixes the robot\'s capabilities before a single line of code is written. Software cannot make a joint move in a direction the mechanism does not allow.',
          objectives: ['Distinguish revolute and prismatic joints.', 'Explain serial and parallel chains.', 'Relate joint layout to robot type.'],
          sections: [
            {
              heading: 'Joint types',
              body: 'A revolute joint (R) rotates about an axis, like an elbow. A prismatic joint (P) slides along an axis, like a drawer. Other joints, such as ball joints, combine several DOF but are rarely motorised directly. Robot structures are often named by their joints: a SCARA arm is RRP plus a wrist rotation.',
            },
            {
              heading: 'Serial and parallel chains',
              body: 'In a serial chain each link carries the next, so errors and loads accumulate along the arm, but the workspace is large. In a parallel mechanism several chains connect the base to the tool, as in a delta robot, giving high stiffness and speed in a smaller workspace.',
            },
          ],
          keyTerms: [
            ['Revolute joint', 'A joint that allows rotation about one axis.'],
            ['Prismatic joint', 'A joint that allows sliding along one axis.'],
            ['Serial manipulator', 'An open chain of links from base to tool.'],
            ['Parallel manipulator', 'A closed-loop mechanism with several chains supporting the tool.'],
          ],
          example:
            'A 3D printer is a Cartesian robot with three prismatic joints (PPP). A delta 3D printer achieves the same motion with three parallel arms, trading a simpler frame for more complex maths.',
          practice: 'Describe the joints of a desk lamp, a door, a drawer and an excavator using R and P notation.',
          videoQuery: 'robot links joints revolute prismatic kinematic chain serial parallel manipulator',
        },
        {
          id: 'actuators-motors',
          title: 'Actuators: DC, servo and stepper motors',
          minutes: 25,
          summary:
            'Electric motors are the most common robot actuators. Brushed DC motors are simple and cheap, hobby servos hold an angle on command, stepper motors move in precise steps without feedback, and brushless motors give high efficiency and power density.',
          why: 'The motor determines how fast, how strong and how precise a robot can be, and it often dominates cost, weight and battery life.',
          objectives: ['Compare DC, servo, stepper and brushless motors.', 'Read a motor torque–speed curve.', 'Pick a motor type for a task.'],
          sections: [
            {
              heading: 'Motor types',
              body: 'A brushed DC motor spins faster with more voltage; reversing polarity reverses it. A hobby servo packs a DC motor, gearbox, position sensor and controller into one case and moves to the angle you command with a pulse. A stepper motor moves one fixed step (often 1.8°) per pulse, so you can count position, but it can silently skip steps if overloaded. Brushless DC (BLDC) motors are commutated electronically and power drones, e-bikes and modern robot joints.',
            },
            {
              heading: 'Torque and speed',
              body: 'Torque is rotational force, measured in newton-metres (N·m). A DC motor delivers its maximum (stall) torque at zero speed and zero torque at its no-load speed, with a roughly straight line in between. Peak mechanical power occurs near half the no-load speed. Running near stall for long draws high current and overheats the motor.',
            },
          ],
          keyTerms: [
            ['Torque', 'Rotational force, in newton-metres (N·m).'],
            ['Stall torque', 'The torque a motor produces when it is held stationary at rated voltage.'],
            ['Stepper motor', 'A motor that rotates in fixed angular steps.'],
            ['BLDC', 'Brushless DC motor: electronically commutated, efficient and durable.'],
          ],
          example:
            'Small educational rovers use geared brushed DC motors for wheels, a hobby servo to pan a distance sensor, and sometimes steppers for a precise lifting mechanism.',
          practice:
            'A motor has a stall torque of 0.5 N·m and a no-load speed of 300 rpm. Estimate its speed when delivering 0.25 N·m, and the mechanical power at that point (P = torque × angular speed in rad/s).',
          videoQuery: 'DC motor vs servo vs stepper motor robotics torque speed curve explained',
        },
        {
          id: 'gears-transmissions',
          title: 'Gears, transmissions and torque',
          minutes: 25,
          summary:
            'Transmissions trade speed for torque. A gear ratio of N:1 divides the output speed by N and multiplies the torque by roughly N, minus friction losses. Gears, belts, lead screws, harmonic drives and planetary gearboxes each suit different jobs.',
          why: 'Small motors spin fast with little torque; robot joints and wheels need slow, strong motion. Correct gearing is what lets a tiny motor lift a real load.',
          objectives: ['Calculate output speed and torque through a gear ratio.', 'Estimate the torque a joint needs to hold a load.', 'Compare common transmission types.'],
          sections: [
            {
              heading: 'Gear ratios',
              body: 'If a 10-tooth gear drives a 50-tooth gear, the ratio is 5:1. Output speed is input speed ÷ 5, and output torque is input torque × 5 × efficiency. A typical spur gear stage is around 90–95% efficient, so multiple stages lose noticeable power.',
            },
            {
              heading: 'Sizing a joint',
              body: 'To hold a 1 kg mass at the end of a 0.3 m horizontal arm, the joint needs torque = mass × g × distance = 1 × 9.81 × 0.3 ≈ 2.9 N·m, plus the arm\'s own weight and a safety margin (often 1.5–2×) for acceleration.',
            },
            {
              heading: 'Transmission types',
              body: 'Spur and planetary gearboxes are compact and common. Belts are quiet and allow the motor to sit away from the joint. Lead screws convert rotation into precise linear motion. Harmonic (strain-wave) drives give high ratios with almost no backlash and are used in many collaborative arms.',
            },
          ],
          keyTerms: [
            ['Gear ratio', 'Ratio of input speed to output speed.'],
            ['Backlash', 'Free play between gear teeth that causes small position errors when direction changes.'],
            ['Efficiency', 'Fraction of input power delivered to the output.'],
            ['Harmonic drive', 'A compact, high-ratio, near-zero-backlash gear using a flexible spline.'],
          ],
          example:
            'A wheel motor spinning at 6,000 rpm with 0.02 N·m through a 30:1 gearbox gives about 200 rpm and roughly 0.5 N·m at the wheel after losses, enough to move a small rover.',
          practice:
            'Your robot arm\'s shoulder must hold 0.5 kg at 0.25 m. Calculate the required torque with a 2× safety margin, then choose a gear ratio for a motor that provides 0.1 N·m.',
          videoQuery: 'gear ratio torque speed robotics transmission planetary harmonic drive explained',
        },
        {
          id: 'forward-kinematics',
          title: 'Forward kinematics of a planar arm',
          minutes: 30,
          summary:
            'Forward kinematics computes where the end effector is from the joint angles. For a two-link planar arm it is two lines of trigonometry; for larger arms the same idea is applied with transformation matrices.',
          why: 'Every robot arm controller, simulator and visualiser computes forward kinematics many times per second. It is also the foundation of inverse kinematics: finding joint angles that reach a target.',
          objectives: ['Derive the forward kinematics of a two-link arm.', 'Explain what inverse kinematics solves.', 'Recognise singularities.'],
          sections: [
            {
              heading: 'Two-link arm',
              body: 'With link lengths L1 and L2 and joint angles θ1 and θ2 (θ2 measured relative to the first link), the tool position is x = L1·cos θ1 + L2·cos(θ1 + θ2) and y = L1·sin θ1 + L2·sin(θ1 + θ2).',
            },
            {
              heading: 'Inverse kinematics',
              body: 'Inverse kinematics (IK) runs the problem backwards: given a target (x, y), find θ1 and θ2. A two-link arm usually has two solutions, "elbow up" and "elbow down"; targets beyond L1 + L2 have none. Larger arms are solved with numerical methods, which libraries such as MoveIt provide.',
            },
            {
              heading: 'Singularities',
              body: 'At a singularity the arm loses the ability to move in some direction, for example when fully stretched. Near singularities small tool motions require huge joint speeds, so motion planners avoid them.',
            },
          ],
          keyTerms: [
            ['Forward kinematics', 'Computing the tool pose from joint values.'],
            ['Inverse kinematics', 'Computing joint values that achieve a desired tool pose.'],
            ['Singularity', 'A configuration where the robot loses one or more directions of motion.'],
            ['Denavit–Hartenberg (DH)', 'A standard convention for assigning frames to links of a serial robot.'],
          ],
          example:
            'With L1 = 0.3 m, L2 = 0.2 m, θ1 = 30° and θ2 = 45°: x = 0.3·cos30° + 0.2·cos75° ≈ 0.260 + 0.052 = 0.312 m, y = 0.3·sin30° + 0.2·sin75° ≈ 0.150 + 0.193 = 0.343 m.',
          practice:
            'Write a short program (Python or a spreadsheet) that computes the tool position of a two-link arm for θ1 and θ2 from 0° to 180° in 15° steps, and plot the points to visualise the workspace.',
          videoQuery: 'forward kinematics two link planar arm robotics tutorial',
        },
        {
          id: 'end-effectors-structure',
          title: 'End effectors, materials and structure',
          minutes: 20,
          summary:
            'End effectors are the robot\'s hands: parallel grippers, vacuum cups, soft grippers and tools. The frame that carries them must be stiff, light and strong enough, which drives the choice of materials such as aluminium, steel, plastics and composites.',
          why: 'A robot is only as useful as what it can grip or do at the end of the arm, and a flexible or heavy frame wastes motor torque and ruins precision.',
          objectives: ['Choose a gripper type for an object.', 'Explain stiffness, strength and weight trade-offs.', 'Describe rapid prototyping options for robot parts.'],
          sections: [
            {
              heading: 'Grippers and tools',
              body: 'Two-finger parallel grippers handle rigid parts. Vacuum cups lift flat, smooth surfaces such as boxes and glass. Soft grippers made of silicone conform to delicate or irregular objects like fruit. Magnetic grippers lift steel. Many robots use tool changers to switch between end effectors automatically.',
            },
            {
              heading: 'Materials and fabrication',
              body: 'Aluminium extrusions are the standard for frames and prototypes. 3D-printed PLA and PETG suit brackets and light parts; nylon and carbon-fibre-filled filaments are tougher. Laser-cut acrylic and plywood are fast for flat chassis. Always check that the structure does not flex enough to change the tool position noticeably under load.',
            },
          ],
          keyTerms: [
            ['End effector', 'The device at the end of a manipulator that interacts with the environment.'],
            ['Payload', 'The maximum mass a robot can handle, including the end effector.'],
            ['Stiffness', 'Resistance of a structure to deformation under load.'],
            ['Compliance', 'The opposite of stiffness; useful in grippers that must adapt to object shape.'],
          ],
          example:
            'Food-handling robots often use soft pneumatic fingers that wrap around a pastry or tomato without bruising it, something a rigid metal gripper would struggle to do.',
          practice:
            'For each object, choose and justify a gripper: an egg, a cardboard box, a steel bolt, a smartphone, a plush toy.',
          videoQuery: 'robot end effector gripper types vacuum soft gripper design',
        },
      ],
      project: {
        title: 'Two-link arm calculator and model',
        description: 'Build a cardboard or 3D-printed two-link arm with protractor scales at each joint, and a program that predicts the tool position.',
        deliverables: [
          'A forward-kinematics program for your arm\'s link lengths.',
          'Five measured tool positions compared with predictions, with the error for each.',
          'A torque estimate for the shoulder joint holding a 100 g load at full reach.',
        ],
      },
    },
    // ───────────────────────────────────────────── Module 3
    {
      id: 'electronics',
      title: 'Electronics for Robotics',
      level: 'Beginner',
      summary: 'The electrical foundations of robots: circuits, microcontrollers, motor drivers, batteries and power distribution.',
      objectives: [
        'Apply Ohm\'s law and power calculations to robot circuits.',
        'Use microcontroller GPIO, PWM and analog inputs.',
        'Size a battery and wire a motor driver safely.',
      ],
      lessons: [
        {
          id: 'circuits-basics',
          title: 'Voltage, current, resistance and power',
          minutes: 25,
          summary:
            'Voltage pushes current through a circuit, resistance limits it, and power is the rate at which energy is used. Ohm\'s law (V = I × R) and the power law (P = V × I) let you predict how every part of a robot\'s electronics behaves.',
          why: 'Most robot electronics failures, such as burned parts, brownouts and resetting boards, come from currents and voltages nobody calculated.',
          objectives: ['Apply Ohm\'s law.', 'Calculate power and choose component ratings.', 'Use a multimeter to measure voltage, current and continuity.'],
          sections: [
            {
              heading: 'The core relationships',
              body: 'Ohm\'s law: V = I × R. Power: P = V × I = I² × R. A 220 Ω resistor across 5 V passes about 23 mA and dissipates about 0.11 W, so a common 0.25 W resistor is fine. Components must be rated above the voltage, current and power they will see.',
            },
            {
              heading: 'Series, parallel and ground',
              body: 'Series components share the same current; parallel components share the same voltage. Every part of a robot must share a common ground (0 V reference), otherwise signals between boards are meaningless. Missing grounds are one of the most frequent beginner wiring faults.',
            },
            {
              heading: 'Measuring',
              body: 'A multimeter measures voltage in parallel with a component and current in series with it. Use continuity mode to find broken wires before applying power. Always start on the highest range when you are unsure of a value.',
            },
          ],
          keyTerms: [
            ['Voltage (V)', 'Electrical potential difference, in volts.'],
            ['Current (I)', 'Flow of electric charge, in amperes.'],
            ['Resistance (R)', 'Opposition to current, in ohms (Ω).'],
            ['Common ground', 'A shared 0 V reference connecting all parts of a system.'],
          ],
          example:
            'An LED with a 2 V forward voltage on a 5 V pin needs a resistor of (5 − 2) / 0.015 = 200 Ω to limit its current to 15 mA; 220 Ω is the nearest standard value.',
          practice:
            'Calculate the current and power for a 12 V motor with 4 Ω winding resistance at stall. Then explain why the motor driver and fuse must be rated for that current even if normal running current is much lower.',
          videoQuery: 'ohms law voltage current resistance power basics electronics for robotics',
        },
        {
          id: 'microcontrollers',
          title: 'Microcontrollers: GPIO, PWM and ADC',
          minutes: 30,
          summary:
            'A microcontroller is a small computer on one chip that reads sensors and drives actuators in real time. Its key peripherals are digital input/output pins (GPIO), pulse-width modulation (PWM) outputs, and analog-to-digital converters (ADC).',
          why: 'Microcontrollers are the robot\'s reflexes. They run the fast, reliable low-level loops that a laptop or single-board computer cannot guarantee.',
          objectives: ['Read digital and analog inputs.', 'Generate PWM to control speed and brightness.', 'Compare microcontrollers and single-board computers.'],
          sections: [
            {
              heading: 'GPIO and ADC',
              body: 'A GPIO pin is either an output (HIGH or LOW) or an input that reads a voltage as 0 or 1. A pull-up or pull-down resistor keeps an unconnected input from floating. An ADC converts a voltage into a number: a 10-bit ADC on a 5 V reference maps 0–5 V to 0–1023, about 4.9 mV per step.',
            },
            {
              heading: 'PWM',
              body: 'Pulse-width modulation switches a pin on and off rapidly. The duty cycle, the percentage of time it is on, sets the average power delivered. 50% duty on a motor driver gives roughly half speed. Hobby servos use a different convention: a pulse of about 1–2 ms repeated every 20 ms sets the angle.',
            },
            {
              heading: 'Choosing a controller',
              body: 'Arduino-class boards (AVR, ARM Cortex-M) are simple and deterministic. ESP32 boards add Wi-Fi and Bluetooth. Single-board computers such as Raspberry Pi run Linux, Python and ROS 2, and handle cameras, but are not real-time. Many robots use both: a computer for thinking and a microcontroller for reflexes.',
            },
          ],
          keyTerms: [
            ['GPIO', 'General-purpose input/output pin.'],
            ['PWM', 'Pulse-width modulation: varying the on-time of a fast square wave.'],
            ['Duty cycle', 'Percentage of each PWM period that the signal is high.'],
            ['ADC', 'Analog-to-digital converter.'],
          ],
          example:
            'A line-following robot reads three infrared reflectance sensors through ADC pins and sets two PWM outputs, one per motor, hundreds of times per second.',
          practice:
            'On a microcontroller (or a free online simulator such as Wokwi), read a potentiometer with the ADC and use the value to set an LED\'s PWM brightness. Print the raw reading and duty cycle to the serial monitor.',
          videoQuery: 'microcontroller GPIO PWM ADC arduino tutorial for robotics',
        },
        {
          id: 'motor-drivers',
          title: 'Motor drivers and H-bridges',
          minutes: 25,
          summary:
            'A microcontroller pin can supply only a few milliamps, while motors need amps. A motor driver uses transistors arranged as an H-bridge to switch battery power through the motor in either direction under control of low-power logic signals.',
          why: 'Connecting a motor directly to a microcontroller pin will damage the pin. Every motorised robot needs an appropriate driver, and its rating limits how hard the motor can be pushed.',
          objectives: ['Explain how an H-bridge reverses a motor.', 'Choose a driver from motor current ratings.', 'Protect circuits from motor noise and back-EMF.'],
          sections: [
            {
              heading: 'The H-bridge',
              body: 'Four switches form an H shape around the motor. Closing the top-left and bottom-right switches drives current one way; the other diagonal reverses it. Closing both top or both bottom switches brakes the motor. Never close both switches on one side, which short-circuits the supply ("shoot-through"); driver chips prevent this.',
            },
            {
              heading: 'Choosing and protecting',
              body: 'Pick a driver whose continuous current rating exceeds the motor\'s running current and whose peak rating covers stall current. Modern MOSFET drivers are far more efficient than old bipolar chips such as the L298N. Add a fuse, keep motor wires short and twisted, and place capacitors near the motor to suppress electrical noise that can reset your microcontroller.',
            },
          ],
          keyTerms: [
            ['H-bridge', 'A four-switch circuit that drives a DC motor in both directions.'],
            ['MOSFET', 'A transistor used as a fast, efficient electronic switch.'],
            ['Back-EMF', 'Voltage generated by a spinning motor that opposes the supply.'],
            ['Shoot-through', 'A short circuit caused by turning on both switches on one side of a bridge.'],
          ],
          example:
            'A small rover uses a dual MOSFET driver board: each motor gets one PWM pin for speed and one direction pin, and the board\'s thermal shutdown protects it if a wheel jams.',
          practice:
            'Wire a DC motor through a driver to a microcontroller and write a sketch that ramps speed up and down in both directions. Measure the motor current at full speed and with the shaft gently held.',
          videoQuery: 'H bridge motor driver explained arduino DC motor direction speed',
        },
        {
          id: 'power-batteries',
          title: 'Batteries and power distribution',
          minutes: 25,
          summary:
            'Robots usually run from batteries. Capacity (mAh or Wh), voltage, discharge rate and chemistry determine runtime and peak power. Regulators convert battery voltage into the clean voltages that electronics need.',
          why: 'Power problems cause the most confusing robot bugs, such as random resets, sensors that misread when motors start, and short runtimes, and lithium batteries are a genuine fire risk when mishandled.',
          objectives: ['Estimate runtime from capacity and current.', 'Choose a regulator.', 'Handle lithium batteries safely.'],
          sections: [
            {
              heading: 'Capacity and runtime',
              body: 'Runtime ≈ capacity ÷ average current. A 2,000 mAh battery powering a robot that draws 500 mA on average lasts about four hours in theory; plan for around 70–80% of that in practice. Energy in watt-hours = voltage × amp-hours, which is the fairer way to compare packs of different voltages.',
            },
            {
              heading: 'Regulation and distribution',
              body: 'Motors can run directly from the battery, but logic needs a steady 5 V or 3.3 V. Switching (buck) regulators are efficient; linear regulators are simple but waste the voltage difference as heat. Use separate supply branches for motors and logic, a main switch, a fuse near the battery, and a shared ground.',
            },
            {
              heading: 'Lithium safety',
              body: 'Lithium-ion and LiPo cells must not be over-charged, over-discharged, punctured or short-circuited. Use a proper balance charger, a battery management system (BMS) or low-voltage cutoff, fire-resistant storage, and never charge unattended.',
            },
          ],
          keyTerms: [
            ['mAh', 'Milliamp-hours: charge capacity of a battery.'],
            ['C-rating', 'Maximum safe discharge current as a multiple of capacity.'],
            ['Buck converter', 'An efficient switching regulator that lowers voltage.'],
            ['BMS', 'Battery management system: protects cells and balances them.'],
          ],
          example:
            'A delivery robot uses a 24 V lithium pack with a BMS. Drive motors take power directly, a buck converter supplies 12 V for the computer and 5 V for sensors, and an emergency-stop circuit can cut motor power independently of the computer.',
          practice:
            'Draw a power distribution diagram for a small rover with two 6 V motors, a 5 V microcontroller and a 5 V distance sensor, running from a 7.4 V 2S LiPo. Include the fuse, switch, regulator and ground connections.',
          videoQuery: 'robot battery power distribution LiPo buck converter regulator safety',
        },
      ],
      project: {
        title: 'Motor control test bench',
        description: 'Build a bench that drives a geared DC motor through an H-bridge, powered by a fused battery, and controlled by a potentiometer.',
        deliverables: [
          'A wiring diagram with power, ground and signal paths.',
          'Code mapping the potentiometer to speed and direction, with a dead zone in the middle.',
          'A table of measured current at five speeds, and an estimated runtime for your battery.',
        ],
      },
    },
    // ───────────────────────────────────────────── Module 4
    {
      id: 'sensors',
      title: 'Sensors and Perception',
      level: 'Intermediate',
      summary: 'How robots measure themselves and the world, from encoders and IMUs to LiDAR and cameras, and how to make noisy data trustworthy.',
      objectives: [
        'Interpret sensor specifications: range, resolution, accuracy, noise.',
        'Use encoders, IMUs and distance sensors.',
        'Filter and fuse sensor data.',
      ],
      lessons: [
        {
          id: 'sensor-fundamentals',
          title: 'Sensor fundamentals: accuracy, precision and noise',
          minutes: 20,
          summary:
            'Every sensor reading is an estimate. Accuracy is how close readings are to the truth, precision is how consistent they are, resolution is the smallest change detected, and noise is random variation. Calibration and filtering improve what you get.',
          why: 'Robots act on what their sensors tell them. Reading a spec sheet correctly is what stops you from trusting a measurement more than it deserves.',
          objectives: ['Distinguish accuracy, precision and resolution.', 'Explain sampling rate and latency.', 'Calibrate a sensor against a reference.'],
          sections: [
            {
              heading: 'Key specifications',
              body: 'Range: minimum and maximum measurable values. Resolution: smallest detectable change. Accuracy: systematic error from the true value. Precision (repeatability): spread of repeated readings. Sampling rate: readings per second. Latency: delay between the event and the reading being available.',
            },
            {
              heading: 'Proprioceptive and exteroceptive',
              body: 'Proprioceptive sensors measure the robot itself (wheel encoders, joint angles, motor current, battery voltage). Exteroceptive sensors measure the environment (distance sensors, cameras, microphones, touch). Robust robots use both, because each covers the other\'s blind spots.',
            },
          ],
          keyTerms: [
            ['Accuracy', 'Closeness of a measurement to the true value.'],
            ['Precision', 'Repeatability of measurements.'],
            ['Calibration', 'Adjusting readings using known reference values.'],
            ['Latency', 'Delay between a physical event and its measurement being available.'],
          ],
          example:
            'An ultrasonic sensor may report distances to the nearest millimetre (resolution) but be off by ±1 cm (accuracy) and jump by a few millimetres between readings of a still wall (noise).',
          practice:
            'Take 50 readings of a fixed distance with any distance sensor. Compute the mean and standard deviation, then compare the mean with a tape-measure value to estimate the sensor\'s accuracy and precision.',
          videoQuery: 'sensor accuracy precision resolution noise calibration robotics',
        },
        {
          id: 'encoders-imu',
          title: 'Encoders and IMUs',
          minutes: 25,
          summary:
            'Encoders measure shaft rotation, giving wheel distance and joint angle. An inertial measurement unit (IMU) combines accelerometers and gyroscopes, and often a magnetometer, to measure acceleration, rotation rate and orientation.',
          why: 'These are the robot\'s sense of its own body. Odometry, balancing, joint control and drone flight all depend on them.',
          objectives: ['Convert encoder counts into distance and speed.', 'Explain gyroscope drift and accelerometer noise.', 'Combine IMU sensors with a complementary filter.'],
          sections: [
            {
              heading: 'Encoders',
              body: 'An incremental quadrature encoder outputs two pulse trains, A and B, 90° out of phase; their order shows direction. Counts per revolution (CPR) together with the gear ratio and wheel circumference gives distance per count. Absolute encoders report the angle directly, even after power-up.',
            },
            {
              heading: 'IMUs',
              body: 'Gyroscopes measure angular velocity; integrating it gives angle, but small errors accumulate as drift. Accelerometers measure gravity plus motion; they give tilt without drift but are noisy when the robot moves. A complementary filter blends both: angle = 0.98 × (angle + gyro × dt) + 0.02 × accelerometer angle.',
            },
          ],
          keyTerms: [
            ['Quadrature encoder', 'An encoder with two phase-shifted channels that reveal direction.'],
            ['CPR', 'Counts per revolution.'],
            ['Gyroscope drift', 'Slowly growing angle error from integrating small rate errors.'],
            ['Complementary filter', 'A simple fusion of a fast, drifting sensor with a slow, stable one.'],
          ],
          example:
            'A self-balancing robot reads its IMU around 200 times per second, fuses gyro and accelerometer into a tilt angle, and drives its wheels to keep that angle near zero.',
          practice:
            'A wheel of 65 mm diameter is driven through a 48:1 gearbox by a motor with a 12 CPR encoder counted on all four edges (×4). Calculate millimetres travelled per count.',
          videoQuery: 'quadrature encoder IMU gyroscope accelerometer complementary filter robot',
        },
        {
          id: 'range-sensors',
          title: 'Distance sensing: ultrasonic, infrared and LiDAR',
          minutes: 25,
          summary:
            'Range sensors measure how far away things are. Ultrasonic sensors time sound echoes, infrared sensors use reflected light, time-of-flight sensors time light pulses, and LiDAR sweeps a laser to build a 2D or 3D picture of the surroundings.',
          why: 'Obstacle avoidance, mapping and docking all depend on reliable distance measurement, and every technology has blind spots you must design around.',
          objectives: ['Explain how each ranging technology works.', 'Predict when each will fail.', 'Read a 2D LiDAR scan.'],
          sections: [
            {
              heading: 'Ultrasonic and infrared',
              body: 'Ultrasonic sensors measure echo time: distance = speed of sound (about 343 m/s at 20 °C) × time ÷ 2. They have a wide beam and struggle with soft or angled surfaces. Infrared triangulation and time-of-flight sensors are narrow and fast, but sunlight and dark or transparent surfaces can confuse them.',
            },
            {
              heading: 'LiDAR',
              body: 'A 2D LiDAR spins a laser rangefinder to produce a scan: hundreds of distance readings around the robot several times per second. 3D LiDAR adds vertical layers to create point clouds. LiDAR is precise and works in darkness, but glass and mirrors cause missing or ghost readings.',
            },
          ],
          keyTerms: [
            ['Time of flight', 'Measuring distance from the travel time of a signal.'],
            ['Point cloud', 'A set of 3D points measured on surfaces.'],
            ['Field of view', 'The angular extent a sensor can observe.'],
            ['Specular reflection', 'Mirror-like reflection that sends a signal away from the sensor.'],
          ],
          example:
            'Warehouse AMRs typically combine a 2D safety LiDAR at ankle height for obstacle detection and mapping, ultrasonic sensors for glass and low obstacles, and a depth camera for overhanging objects.',
          practice:
            'Measure a wall, a curtain, a glass door and a black object at 50 cm with an ultrasonic or infrared sensor. Record which readings fail and explain why using this lesson.',
          videoQuery: 'ultrasonic vs infrared vs lidar distance sensor robot how it works',
        },
        {
          id: 'cameras-vision',
          title: 'Cameras and computer vision basics',
          minutes: 30,
          summary:
            'A camera gives the richest view of the world but the hardest data to interpret. Computer vision turns pixels into useful information such as colours, edges, markers, objects and depth.',
          why: 'Vision lets robots recognise objects, read signs, find markers, and see what a range sensor cannot. It is the gateway to the AI topics later in the track.',
          objectives: ['Explain pixels, colour spaces and resolution.', 'Apply thresholding and edge detection.', 'Compare monocular, stereo and depth cameras.'],
          sections: [
            {
              heading: 'Images as data',
              body: 'An image is a grid of pixels. Colour images store red, green and blue values, often 0–255 each. The HSV colour space separates hue from brightness, which makes colour detection more robust to lighting. Camera calibration estimates the lens\'s focal length and distortion so pixel positions can be converted into directions.',
            },
            {
              heading: 'Classic vision operations',
              body: 'Thresholding keeps pixels within a colour range. Blurring removes noise. Edge detection (for example the Canny algorithm) finds outlines. Contours group edges into shapes. Fiducial markers such as ArUco and AprilTags give a camera an easy, precise pose estimate. OpenCV implements all of these.',
            },
            {
              heading: 'Depth',
              body: 'One camera cannot measure distance directly. Stereo cameras compare two views like human eyes; structured-light and time-of-flight depth cameras measure distance per pixel. Depth cameras let robots grasp objects and avoid obstacles in three dimensions.',
            },
          ],
          keyTerms: [
            ['HSV', 'Hue, saturation, value: a colour space convenient for colour detection.'],
            ['Camera calibration', 'Estimating lens parameters to relate pixels to real-world directions.'],
            ['Fiducial marker', 'A printed pattern designed to be detected and located easily.'],
            ['OpenCV', 'A widely used open-source computer vision library.'],
          ],
          example: 'A sorting robot uses an overhead camera, HSV thresholding to find red and blue parts on a conveyor, and calibrated pixel-to-millimetre mapping to tell the arm where to pick.',
          practice:
            'Using Python and OpenCV with a webcam, threshold one colour in HSV, draw a box around the largest matching contour, and print its centre pixel coordinates.',
          videoQuery: 'computer vision basics for robotics OpenCV HSV thresholding edge detection',
        },
        {
          id: 'sensor-fusion',
          title: 'Filtering and sensor fusion',
          minutes: 30,
          summary:
            'Sensor fusion combines several imperfect measurements into one better estimate. Moving averages and low-pass filters smooth noise; the Kalman filter weights predictions and measurements by how uncertain each one is.',
          why: 'No single sensor is reliable all of the time. Fusion is how real robots, from phones to self-driving cars, achieve trustworthy position and orientation estimates.',
          objectives: ['Apply moving-average and exponential filters.', 'Explain the predict–update cycle of a Kalman filter.', 'Describe what fusing odometry with an IMU gains.'],
          sections: [
            {
              heading: 'Simple filters',
              body: 'A moving average replaces each reading with the mean of the last N. An exponential filter computes filtered = α × new + (1 − α) × filtered, with α between 0 and 1. More smoothing means more lag, so filtering is always a trade-off between noise and responsiveness.',
            },
            {
              heading: 'The Kalman filter',
              body: 'A Kalman filter keeps an estimate and its uncertainty. In the predict step it uses a motion model to move the estimate forward, and uncertainty grows. In the update step a measurement arrives and the estimate moves towards it in proportion to the Kalman gain, which is large when the prediction is uncertain and small when the measurement is noisy. Extended and unscented variants handle nonlinear systems.',
            },
          ],
          keyTerms: [
            ['Low-pass filter', 'A filter that keeps slow changes and removes fast noise.'],
            ['Kalman gain', 'The weight given to a new measurement relative to the prediction.'],
            ['State estimate', 'The filter\'s best guess of quantities such as position and velocity.'],
            ['EKF', 'Extended Kalman filter, for nonlinear models.'],
          ],
          example:
            'The ROS 2 robot_localization package runs an EKF that fuses wheel odometry, IMU and GPS into one smooth pose estimate for outdoor robots.',
          practice:
            'Record noisy distance readings and apply exponential filters with α = 0.1, 0.3 and 0.7. Plot the results and describe the trade-off you see between smoothness and delay.',
          videoQuery: 'kalman filter explained simply sensor fusion robotics',
        },
      ],
      project: {
        title: 'Obstacle-aware sensor head',
        description: 'Build a sensor head that sweeps a distance sensor on a servo and plots a simple 180° range map.',
        deliverables: [
          'Calibrated distance readings with measured accuracy and noise.',
          'A filtered scan plotted in polar coordinates.',
          'A short report on surfaces your sensor fails on and how you would compensate.',
        ],
      },
    },
    // ───────────────────────────────────────────── Module 5
    {
      id: 'programming',
      title: 'Robot Programming',
      level: 'Intermediate',
      summary: 'Writing robot software: control-loop architecture, embedded C++, Python, ROS 2 and simulation.',
      objectives: [
        'Structure robot code as non-blocking control loops and state machines.',
        'Program microcontrollers in C++ and robots in Python.',
        'Build and test ROS 2 nodes in simulation.',
      ],
      lessons: [
        {
          id: 'software-architecture',
          title: 'Robot software architecture and control loops',
          minutes: 25,
          summary:
            'Robot software runs as loops that read sensors, compute decisions and command actuators at a fixed rate. Good architecture separates these concerns, avoids blocking calls, and organises behaviour into state machines.',
          why: 'Code that uses delays and long blocking calls makes robots sluggish and unsafe. A clean loop structure is what lets a robot react in milliseconds and stay maintainable as it grows.',
          objectives: ['Write a fixed-rate, non-blocking loop.', 'Design a finite state machine for a behaviour.', 'Separate hardware access from decision logic.'],
          sections: [
            {
              heading: 'The control loop',
              body: 'Each cycle: read inputs, update state, compute outputs, write outputs, then wait until the next period. Use timers or elapsed-time checks instead of delay() so that one slow task never stalls the others. Measure your loop rate and keep it constant, because control algorithms assume a steady time step.',
            },
            {
              heading: 'State machines',
              body: 'A finite state machine (FSM) defines states such as IDLE, SEARCHING, APPROACHING and GRASPING, and the events that move between them. FSMs make behaviour explicit, testable and easy to debug. Larger robots use behaviour trees, covered in Module 8.',
            },
            {
              heading: 'Layers',
              body: 'Keep a hardware layer (drivers for each sensor and motor), a control layer (speed and position loops) and a decision layer (behaviours and planning). Then you can swap a sensor or test logic in simulation without rewriting everything.',
            },
          ],
          keyTerms: [
            ['Loop rate', 'How many times per second the control loop runs, in hertz.'],
            ['Blocking call', 'A function that stops the program until it finishes.'],
            ['Finite state machine', 'A model of behaviour as states and transitions.'],
            ['Hardware abstraction', 'An interface that hides hardware details from higher-level code.'],
          ],
          example:
            'A robot lawn mower runs a 100 Hz loop. Its FSM has states for MOWING, TURNING_AT_BOUNDARY, RETURNING_TO_DOCK and CHARGING, triggered by the boundary-wire sensor, a timer and the battery level.',
          practice:
            'Draw a state machine for a robot that follows a line, stops at an obstacle, waits until it clears, and returns to its start when a button is pressed. List every state, event and transition.',
          videoQuery: 'robot software architecture control loop finite state machine non blocking',
        },
        {
          id: 'embedded-cpp',
          title: 'Embedded programming in C++ (Arduino)',
          minutes: 30,
          summary:
            'Microcontrollers are usually programmed in C or C++. The Arduino framework offers setup() and loop() functions and simple libraries for pins, timers, serial communication and interrupts.',
          why: 'Low-level motor control, encoder counting and safety interlocks run on microcontrollers, so a robotics engineer must be able to read and write embedded C++.',
          objectives: ['Write a non-blocking Arduino sketch with millis().', 'Count encoder pulses with interrupts.', 'Communicate with a host computer over serial.'],
          sections: [
            {
              heading: 'Sketch structure',
              body: 'setup() runs once to configure pins and peripherals; loop() runs forever. Use millis() to schedule tasks: if (millis() - lastRead >= 20) { lastRead += 20; readSensors(); } runs a task at 50 Hz without blocking anything else.',
            },
            {
              heading: 'Interrupts',
              body: 'An interrupt runs a short function immediately when a pin changes, which is ideal for counting fast encoder pulses. Keep interrupt service routines tiny, mark shared variables as volatile, and read multi-byte variables with interrupts briefly disabled.',
            },
            {
              heading: 'Serial protocols',
              body: 'Serial links carry commands and telemetry between a microcontroller and a computer. Define a simple, robust message format, for example "V 120 -80\\n" for left and right wheel speeds, and ignore malformed lines. Add a watchdog that stops the motors if commands stop arriving.',
            },
          ],
          keyTerms: [
            ['millis()', 'Arduino function returning milliseconds since start-up.'],
            ['Interrupt', 'A hardware event that pauses the main code to run a handler.'],
            ['volatile', 'C++ keyword telling the compiler a variable can change outside normal flow.'],
            ['Watchdog', 'A timer that triggers a safe action if the system stops responding.'],
          ],
          example:
            'A robot base\'s microcontroller counts encoder ticks with interrupts, runs wheel speed loops at 100 Hz, streams odometry over USB serial, and stops the motors if no velocity command arrives for 500 ms.',
          practice:
            'Write a sketch that blinks one LED every 300 ms and another every 1,100 ms using millis(), while printing a counter over serial every second. Then add a serial command that changes the first LED\'s rate.',
          videoQuery: 'arduino millis non blocking interrupts encoder robot programming tutorial',
        },
        {
          id: 'python-robotics',
          title: 'Python for robotics',
          minutes: 25,
          summary:
            'Python is the most common high-level language in robotics for prototyping, vision, AI, data analysis and ROS 2 nodes. Libraries such as NumPy, OpenCV and Matplotlib make complex tasks short.',
          why: 'Most robotics research code, AI models and tooling is written in Python. It lets you test ideas in hours instead of days.',
          objectives: ['Use NumPy for vectors and matrices.', 'Log and plot robot data.', 'Talk to a microcontroller with pyserial.'],
          sections: [
            {
              heading: 'Essential libraries',
              body: 'NumPy handles arrays, linear algebra and rotations. OpenCV handles images. Matplotlib plots data. pyserial talks to microcontrollers. SciPy offers filters and optimisation. Use a virtual environment (python -m venv) per project to keep dependencies separate.',
            },
            {
              heading: 'Data-driven debugging',
              body: 'Log every important signal (targets, measurements, outputs) with timestamps to a CSV file, then plot it. Graphs reveal oscillations, delays and saturation that are invisible when watching the robot. This habit is the fastest way to tune controllers.',
            },
          ],
          keyTerms: [
            ['NumPy', 'Python library for fast numerical arrays and linear algebra.'],
            ['Virtual environment', 'An isolated set of Python packages for one project.'],
            ['Telemetry', 'Data a robot reports about its state while it runs.'],
            ['Rotation matrix', 'A 3×3 matrix that rotates vectors between frames.'],
          ],
          example:
            'An engineer streams wheel speeds from a rover over serial, saves them with a Python script, and plots target versus measured speed to see that the left motor responds 40 ms slower than the right.',
          practice:
            'Write a Python script that uses NumPy to compute the two-link arm forward kinematics from Module 2 for 1,000 random joint angle pairs, and plot the reachable points with Matplotlib.',
          videoQuery: 'python for robotics numpy opencv matplotlib pyserial tutorial',
        },
        {
          id: 'ros2-basics',
          title: 'ROS 2: nodes, topics, services and actions',
          minutes: 35,
          summary:
            'ROS 2 (Robot Operating System 2) is an open-source framework of communication tools, libraries and conventions for robot software. Programs called nodes exchange data on topics, request work through services, and run long tasks through actions.',
          why: 'ROS 2 is the de facto standard in research and increasingly in industry. Knowing it lets you reuse drivers, navigation, manipulation and visualisation tools instead of writing them from scratch.',
          objectives: ['Explain nodes, topics, services and actions.', 'Write a publisher and subscriber in Python.', 'Use ROS 2 command-line tools and RViz.'],
          sections: [
            {
              heading: 'The communication graph',
              body: 'A node is a single-purpose process, such as a camera driver or a planner. Topics are named streams of typed messages using publish–subscribe: many nodes can publish or listen. Services are request–response calls for quick tasks. Actions handle long-running goals with feedback and cancellation, such as "navigate to the kitchen".',
            },
            {
              heading: 'Working with ROS 2',
              body: 'Code is organised into packages and built with colcon. Launch files start many nodes with parameters. Command-line tools inspect a running system: ros2 topic list, ros2 topic echo /scan, ros2 node info. RViz visualises sensor data, frames and plans; tf2 tracks coordinate frames over time.',
            },
            {
              heading: 'Standard messages',
              body: 'Using standard message types lets packages interoperate: geometry_msgs/Twist for velocity commands on /cmd_vel, sensor_msgs/LaserScan for LiDAR, sensor_msgs/Image for cameras and nav_msgs/Odometry for odometry.',
            },
          ],
          keyTerms: [
            ['Node', 'A ROS 2 process that performs one job.'],
            ['Topic', 'A named publish–subscribe channel for messages.'],
            ['Service', 'A synchronous request–response interface.'],
            ['Action', 'An interface for long tasks with feedback and cancellation.'],
          ],
          example:
            'A mobile robot runs a LiDAR driver node publishing /scan, a base node subscribing to /cmd_vel and publishing /odom, and the Nav2 stack, which consumes both and exposes a navigate_to_pose action.',
          practice:
            'Install ROS 2 (or use a ROS 2 Docker image), then write a Python node that publishes a counter on /count at 2 Hz and a second node that subscribes and logs the values. Inspect them with ros2 topic echo.',
          videoQuery: 'ROS 2 tutorial for beginners nodes topics services actions python',
        },
        {
          id: 'simulation',
          title: 'Simulation and digital twins',
          minutes: 25,
          summary:
            'Simulators such as Gazebo, Webots and Isaac Sim model a robot\'s physics, sensors and environment, so software can be developed and tested safely before it touches hardware.',
          why: 'Simulation is faster, cheaper and safer than hardware testing. It lets you test edge cases repeatedly and generate training data for AI.',
          objectives: ['Describe a robot with a URDF model.', 'Run a robot in a simulator connected to ROS 2.', 'Recognise the sim-to-real gap.'],
          sections: [
            {
              heading: 'Robot models',
              body: 'A URDF (Unified Robot Description Format) file describes links, joints, inertia, collision shapes and visual meshes. Xacro adds variables and macros. The same model drives simulation, visualisation in RViz and kinematics libraries.',
            },
            {
              heading: 'The sim-to-real gap',
              body: 'Simulated friction, sensor noise, latency and lighting never match reality perfectly. Close the gap by adding realistic noise and delay, randomising parameters (domain randomisation), and always validating on hardware in small, safe steps.',
            },
          ],
          keyTerms: [
            ['URDF', 'XML format describing a robot\'s links and joints.'],
            ['Gazebo', 'An open-source robot simulator widely used with ROS.'],
            ['Digital twin', 'A live virtual model synchronised with a real system.'],
            ['Sim-to-real gap', 'Differences between simulated and real behaviour.'],
          ],
          example:
            'A team tunes a warehouse robot\'s navigation in Gazebo with a model of the real warehouse, then validates on hardware at night with a reduced speed limit before full deployment.',
          practice:
            'Run a standard ROS 2 simulation of a small differential-drive robot (for example the TurtleBot tutorials), drive it with the teleoperation keyboard node, and view its LiDAR scan in RViz.',
          videoQuery: 'gazebo ROS 2 simulation URDF tutorial beginner robot',
        },
      ],
      project: {
        title: 'Teleoperated rover with telemetry',
        description: 'Program a two-wheel rover whose microcontroller accepts speed commands from a computer and streams telemetry back.',
        deliverables: [
          'A non-blocking microcontroller sketch with a command watchdog.',
          'A Python or ROS 2 node that sends keyboard commands and logs telemetry to CSV.',
          'Plots of commanded versus measured wheel speed.',
        ],
      },
    },
    // ───────────────────────────────────────────── Module 6
    {
      id: 'control',
      title: 'Control Systems',
      level: 'Intermediate',
      summary: 'Making robots move accurately: feedback, PID control, tuning and mobile robot kinematics.',
      objectives: [
        'Explain open-loop and closed-loop control.',
        'Implement and tune a PID controller.',
        'Compute differential-drive kinematics and odometry.',
      ],
      lessons: [
        {
          id: 'feedback-control',
          title: 'Open-loop and closed-loop control',
          minutes: 20,
          summary:
            'Open-loop control sends commands without checking the result. Closed-loop (feedback) control measures the output, compares it with the target, and corrects the error continuously.',
          why: 'Batteries drain, loads change and floors vary. Only feedback control keeps a robot doing what you asked despite these disturbances.',
          objectives: ['Distinguish open- and closed-loop control.', 'Identify setpoint, error, controller, plant and sensor.', 'Describe stability, overshoot and steady-state error.'],
          sections: [
            {
              heading: 'The feedback loop',
              body: 'The setpoint is what you want. The sensor measures what you have. Error = setpoint − measurement. The controller converts error into an actuator command that drives the plant (the system being controlled). Done right, the error shrinks towards zero.',
            },
            {
              heading: 'Judging performance',
              body: 'Rise time: how fast the output approaches the target. Overshoot: how far it goes past. Settling time: how long until it stays near the target. Steady-state error: what remains at rest. An unstable loop oscillates or runs away, which is dangerous on real hardware.',
            },
          ],
          keyTerms: [
            ['Setpoint', 'The desired value of a controlled quantity.'],
            ['Plant', 'The physical system being controlled.'],
            ['Overshoot', 'How far the output goes beyond the setpoint.'],
            ['Steady-state error', 'Error remaining after the response settles.'],
          ],
          example:
            'Driving for two seconds at 50% PWM (open loop) moves a rover a different distance on carpet and on tile. Counting encoder ticks and stopping at a target count (closed loop) gives the same distance on both.',
          practice:
            'Drive a rover forward open-loop for a fixed time on two different floors and measure the distance. Then stop on an encoder target instead and compare the consistency.',
          videoQuery: 'open loop vs closed loop control feedback explained robotics',
        },
        {
          id: 'pid-control',
          title: 'PID control',
          minutes: 35,
          summary:
            'A PID controller computes its output from three terms: Proportional to the current error, Integral of past error, and Derivative of the error\'s rate of change. It is the most widely used controller in robotics and industry.',
          why: 'Motor speed, joint position, heading, balance and temperature control almost always start with PID. Knowing how to implement and tune it is a core robotics skill.',
          objectives: ['Write a discrete PID controller.', 'Describe the effect of each gain.', 'Handle integral windup and derivative noise.'],
          sections: [
            {
              heading: 'The three terms',
              body: 'output = Kp·e + Ki·∫e dt + Kd·de/dt. P reacts to the present error: more Kp gives faster response but more overshoot. I removes steady-state error by accumulating it, but can cause slow oscillation. D damps motion by reacting to how fast the error changes, reducing overshoot, but amplifies sensor noise.',
            },
            {
              heading: 'Discrete implementation',
              body: 'In code, at a fixed time step dt: integral += error × dt; derivative = (error − previousError) / dt; output = Kp × error + Ki × integral + Kd × derivative; previousError = error. Clamp the output to the actuator\'s range.',
            },
            {
              heading: 'Practical details',
              body: 'Integral windup happens when the actuator saturates while the integral keeps growing; limit the integral or stop accumulating while saturated. Filter the derivative, or take it on the measurement instead of the error, to avoid kicks when the setpoint jumps.',
            },
          ],
          keyTerms: [
            ['Kp, Ki, Kd', 'Proportional, integral and derivative gains.'],
            ['Integral windup', 'Excess accumulation of the integral term during saturation.'],
            ['Saturation', 'When an actuator reaches its maximum output.'],
            ['Derivative kick', 'A spike in output caused by a sudden setpoint change.'],
          ],
          example:
            'A drone runs nested PID loops: an inner loop controls rotation rate hundreds of times per second, and an outer loop controls angle. The pilot\'s stick commands the outer loop\'s setpoint.',
          practice:
            'Implement PID wheel-speed control on your rover, or in a Python simulation of a first-order motor model. Log setpoint and speed for step changes and record the effect of doubling each gain.',
          videoQuery: 'PID controller explained tuning robotics motor control',
        },
        {
          id: 'pid-tuning',
          title: 'Tuning controllers in practice',
          minutes: 25,
          summary:
            'Tuning means choosing gains that give a fast, stable, well-damped response. Methodical manual tuning, the Ziegler–Nichols method, and data logging make tuning reliable instead of guesswork.',
          why: 'Badly tuned loops make robots shake, overshoot targets, wear out gears, or become unsafe. Good tuning is often the difference between a demo and a product.',
          objectives: ['Follow a manual tuning procedure.', 'Use step responses to judge tuning.', 'Know when PID is not enough.'],
          sections: [
            {
              heading: 'A manual procedure',
              body: 'Start with Ki = Kd = 0. Raise Kp until the response is quick with slight oscillation, then back off. Add Kd to damp the overshoot. Add a small Ki to remove remaining steady-state error. Change one gain at a time, by factors of about two, and log each step response.',
            },
            {
              heading: 'Ziegler–Nichols and beyond',
              body: 'Ziegler–Nichols raises Kp until steady oscillation appears (the ultimate gain Ku, with period Tu) and derives gains from those values; it is a starting point and is often aggressive. Feedforward adds a predicted command, for example the voltage needed for a target speed, so feedback only corrects the remainder. Systems with strong coupling or constraints may need model-based control such as LQR or MPC.',
            },
          ],
          keyTerms: [
            ['Step response', 'How a system reacts to a sudden setpoint change.'],
            ['Ultimate gain (Ku)', 'The proportional gain at which a loop oscillates steadily.'],
            ['Feedforward', 'Control action computed from a model rather than from error.'],
            ['MPC', 'Model predictive control: optimises future actions subject to constraints.'],
          ],
          example:
            'A robot arm joint is tuned with feedforward for gravity and friction, so its PID gains can stay modest, giving smooth and quiet motion.',
          practice:
            'Tune a heading controller that turns your rover to a target angle using the IMU. Record three step responses (under-tuned, over-tuned, good) and annotate rise time and overshoot on each graph.',
          videoQuery: 'PID tuning manual Ziegler Nichols step response practical',
        },
        {
          id: 'mobile-kinematics',
          title: 'Differential-drive kinematics and odometry',
          minutes: 30,
          summary:
            'A differential-drive robot steers by driving its two wheels at different speeds. Its kinematics convert wheel speeds into forward and turning velocity, and odometry integrates them over time to estimate position.',
          why: 'Most mobile robots, from robot vacuums to warehouse AMRs, are differential drive. Odometry is the first ingredient of localization and navigation.',
          objectives: ['Convert between wheel speeds and robot velocity.', 'Integrate odometry to estimate pose.', 'Explain why odometry drifts.'],
          sections: [
            {
              heading: 'Kinematics',
              body: 'With wheel speeds vL and vR and wheel separation b: forward speed v = (vR + vL) / 2 and turning rate ω = (vR − vL) / b. Inverting: vR = v + ω·b/2 and vL = v − ω·b/2. This is how a /cmd_vel Twist message becomes wheel commands.',
            },
            {
              heading: 'Odometry',
              body: 'Each time step: x += v·cos θ·dt, y += v·sin θ·dt, θ += ω·dt. Wheel slip, uneven floors and small errors in wheel diameter or separation make the estimate drift without bound, especially in heading, which is why odometry is fused with an IMU and corrected by localization.',
            },
          ],
          keyTerms: [
            ['Differential drive', 'Two independently driven wheels on one axle; steering by speed difference.'],
            ['Odometry', 'Estimating pose by integrating wheel motion.'],
            ['Nonholonomic', 'Unable to move directly in some directions, such as sideways.'],
            ['Twist', 'A message with linear and angular velocity.'],
          ],
          example:
            'With b = 0.2 m, a command of v = 0.3 m/s and ω = 1 rad/s gives vR = 0.4 m/s and vL = 0.2 m/s: the robot drives forward while turning left.',
          practice:
            'Implement odometry on your rover, drive a 1 m square, and measure how far the final position is from the start. Then calibrate wheel diameter and separation and repeat (this is the UMBmark idea).',
          videoQuery: 'differential drive kinematics odometry mobile robot tutorial',
        },
      ],
      project: {
        title: 'Precise driving challenge',
        description: 'Make your rover drive an exact square and return to its start using closed-loop control and odometry.',
        deliverables: [
          'PID wheel-speed control with logged, tuned step responses.',
          'Odometry-based navigation through four waypoints.',
          'Measured final position error over five runs, before and after calibration.',
        ],
      },
    },
    // ───────────────────────────────────────────── Module 7
    {
      id: 'ai',
      title: 'Artificial Intelligence for Robotics',
      level: 'Advanced',
      summary: 'How machine learning, deep learning, reinforcement learning and foundation models make robots perceive and decide.',
      objectives: [
        'Explain where machine learning fits in a robot.',
        'Use a pre-trained object detector on robot camera data.',
        'Describe reinforcement learning, imitation learning and foundation models for robots.',
      ],
      lessons: [
        {
          id: 'ml-for-robots',
          title: 'Machine learning for robots',
          minutes: 25,
          summary:
            'Machine learning (ML) builds models from data instead of hand-written rules. In robotics it is used for perception, prediction, control and decision-making, alongside classical algorithms rather than as a replacement for them.',
          why: 'Many robot problems, such as recognising objects or grasping unfamiliar items, are too varied to solve with hand-written rules. ML is how modern robots handle that variety.',
          objectives: ['Distinguish supervised, unsupervised and reinforcement learning.', 'Describe training, validation and test data.', 'Decide when ML is the right tool.'],
          sections: [
            {
              heading: 'Types of learning',
              body: 'Supervised learning learns from labelled examples, for example images tagged "person" or "box". Unsupervised learning finds structure in unlabelled data, such as clusters of similar sensor patterns. Reinforcement learning learns from rewards gained by acting in an environment.',
            },
            {
              heading: 'Data and evaluation',
              body: 'Split data into training, validation and test sets. A model that scores well on training data but poorly on new data is overfitting. In robotics, test on data from new lighting, locations and objects, because the real world will always differ from your dataset.',
            },
            {
              heading: 'Hybrid systems',
              body: 'Successful robots combine learned components (a detector that finds objects) with classical ones (geometry, kinematics, PID, safety logic). Keep safety-critical functions in simple, verifiable code.',
            },
          ],
          keyTerms: [
            ['Supervised learning', 'Learning a mapping from labelled input–output examples.'],
            ['Overfitting', 'When a model memorises training data and fails to generalise.'],
            ['Inference', 'Running a trained model on new data.'],
            ['Dataset shift', 'A difference between training data and real operating conditions.'],
          ],
          example:
            'An agricultural robot uses a trained network to tell crops from weeds in camera images, then a classical controller to aim its weeding tool at the detected positions.',
          practice:
            'List five tasks for a home robot. For each, decide whether a hand-written algorithm, ML, or a combination is most appropriate, and justify your choice in one sentence.',
          videoQuery: 'machine learning for robotics introduction supervised reinforcement learning',
        },
        {
          id: 'deep-learning-vision',
          title: 'Deep learning for robot perception',
          minutes: 30,
          summary:
            'Convolutional neural networks and vision transformers learn visual features directly from images. They power object detection, segmentation, pose estimation and depth estimation on modern robots.',
          why: 'Deep learning made reliable recognition of everyday objects possible, which unlocked practical picking, sorting, inspection and navigation among people.',
          objectives: ['Distinguish classification, detection and segmentation.', 'Run a pre-trained detector.', 'Understand confidence scores and failure modes.'],
          sections: [
            {
              heading: 'Perception tasks',
              body: 'Classification labels a whole image. Object detection draws bounding boxes with labels and confidence scores. Semantic segmentation labels every pixel; instance segmentation separates individual objects. Pose estimation finds keypoints, such as a person\'s joints or an object\'s 6D pose.',
            },
            {
              heading: 'Using models in practice',
              body: 'Start from a pre-trained model and fine-tune it on a few hundred labelled images from your robot\'s own camera (transfer learning). Choose a confidence threshold to balance missed detections against false alarms. Watch for failure modes: unusual lighting, motion blur, occlusion and objects absent from the training data.',
            },
          ],
          keyTerms: [
            ['CNN', 'Convolutional neural network, a network suited to images.'],
            ['Object detection', 'Locating and labelling objects with bounding boxes.'],
            ['Transfer learning', 'Adapting a pre-trained model to a new task with less data.'],
            ['Confidence threshold', 'Minimum score for a detection to be accepted.'],
          ],
          example:
            'A recycling robot runs an instance segmentation model on a conveyor camera to find bottles, cans and cardboard, then a suction gripper picks each item at the centre of its mask.',
          practice:
            'Run a pre-trained object detector (for example a small YOLO model) on your webcam. Record which objects are detected reliably, which are missed, and how lighting changes the confidence scores.',
          videoQuery: 'deep learning object detection segmentation robotics perception YOLO tutorial',
        },
        {
          id: 'reinforcement-learning',
          title: 'Reinforcement and imitation learning',
          minutes: 30,
          summary:
            'Reinforcement learning (RL) trains a policy by trial and error to maximise reward. Imitation learning trains a policy from human demonstrations. Both are used to teach robots skills such as walking and manipulation that are hard to program by hand.',
          why: 'Agile legged locomotion and dexterous manipulation in recent robots were made possible largely by these methods, usually trained in simulation first.',
          objectives: ['Define state, action, reward and policy.', 'Explain why RL usually trains in simulation.', 'Compare RL with imitation learning.'],
          sections: [
            {
              heading: 'The RL loop',
              body: 'An agent observes a state, takes an action, receives a reward and a new state. A policy maps states to actions, and training adjusts it to maximise total future reward. Reward design is critical: a poorly designed reward will be exploited in unexpected ways.',
            },
            {
              heading: 'Simulation and transfer',
              body: 'RL can need millions of trials, which is impractical and unsafe on hardware, so policies are trained in fast parallel simulations with domain randomisation, then transferred to the real robot.',
            },
            {
              heading: 'Learning from demonstration',
              body: 'In imitation learning a person demonstrates a task through teleoperation or by physically guiding the robot, and a model learns to reproduce it. Behaviour cloning is the simplest form. It needs far less trial and error than RL but only covers situations similar to the demonstrations.',
            },
          ],
          keyTerms: [
            ['Policy', 'A function that chooses actions from observations.'],
            ['Reward', 'A numeric signal of how good an outcome is.'],
            ['Domain randomisation', 'Varying simulation parameters so policies transfer to reality.'],
            ['Behaviour cloning', 'Supervised learning of actions from demonstrations.'],
          ],
          example:
            'Quadruped robots learn robust walking gaits in simulation across thousands of randomised terrains, then run the learned policy on hardware to cross gravel, stairs and slopes.',
          practice:
            'Using a free RL library and a classic environment (such as CartPole in Gymnasium), train an agent, plot its reward over training, then change the reward or environment and observe the effect.',
          videoQuery: 'reinforcement learning robotics sim to real imitation learning explained',
        },
        {
          id: 'foundation-models',
          title: 'Foundation models and edge AI',
          minutes: 25,
          summary:
            'Large pre-trained models for language and vision, and vision-language-action models, let robots follow natural-language instructions and generalise across tasks. Running AI on the robot itself (edge AI) requires efficient models and hardware accelerators.',
          why: 'These models are changing how robots are programmed, from writing code for each task towards describing goals, but they bring new reliability, latency and safety challenges.',
          objectives: ['Describe how language models can plan robot tasks.', 'Explain vision-language-action models.', 'Plan for latency, compute and safety on the edge.'],
          sections: [
            {
              heading: 'Language and vision-language models',
              body: 'A language model can break "tidy the table" into steps that call robot skills such as find(cup) and pick(cup). Vision-language-action (VLA) models go further and map camera images plus an instruction directly to robot actions, trained on large multi-robot datasets.',
            },
            {
              heading: 'Edge deployment',
              body: 'Robots need answers in milliseconds and cannot rely on a network connection. Edge AI uses embedded GPUs or neural accelerators, smaller models, quantisation (lower-precision numbers) and optimised runtimes to run inference on board.',
            },
            {
              heading: 'Guardrails',
              body: 'Generative models can be wrong in confident-sounding ways. Validate model outputs against the robot\'s capabilities and safety rules, keep a layer of classical, verifiable safety control underneath, and require human confirmation for consequential actions.',
            },
          ],
          keyTerms: [
            ['Foundation model', 'A large model pre-trained on broad data and adapted to many tasks.'],
            ['VLA model', 'Vision-language-action model mapping images and instructions to actions.'],
            ['Quantisation', 'Using lower-precision numbers to make models smaller and faster.'],
            ['Edge AI', 'Running AI inference on the device instead of in the cloud.'],
          ],
          example:
            'A service robot uses a language model to interpret "bring me something to drink", a detector to find drink bottles, a classical grasp planner to pick one, and Nav2 to deliver it, with a safety controller that can override every step.',
          practice:
            'Design a skill library of five functions for a mobile manipulator (for example navigate_to, find, pick, place, say). Write how a language model could chain them to fulfil three different instructions, and list the checks you would add before execution.',
          videoQuery: 'foundation models robotics vision language action model edge AI explained',
        },
      ],
      project: {
        title: 'Vision-guided robot behaviour',
        description: 'Add an AI perception component to your rover or simulation so its behaviour depends on what it sees.',
        deliverables: [
          'An object detector running on robot camera data, with measured accuracy on 50 of your own images.',
          'A behaviour that reacts to a detection, for example following a person or stopping at a sign.',
          'A failure analysis with at least three conditions where perception fails, and your mitigation for each.',
        ],
      },
    },
    // ───────────────────────────────────────────── Module 8
    {
      id: 'autonomy',
      title: 'Autonomous Systems',
      level: 'Advanced',
      summary: 'How robots know where they are, map the world, plan paths, avoid obstacles and organise complex behaviour.',
      objectives: [
        'Explain localization and SLAM.',
        'Implement grid-based path planning.',
        'Configure a navigation stack and behaviour trees.',
      ],
      lessons: [
        {
          id: 'localization',
          title: 'Localization',
          minutes: 30,
          summary:
            'Localization estimates the robot\'s pose within a known map. Probabilistic methods such as particle filters (Monte Carlo localization) maintain many hypotheses and keep those that best explain sensor readings.',
          why: 'A robot that does not know where it is cannot navigate to a goal. Localization corrects the drift that odometry alone always accumulates.',
          objectives: ['Explain why localization must be probabilistic.', 'Describe how a particle filter works.', 'Compare indoor and outdoor localization methods.'],
          sections: [
            {
              heading: 'Particle filters',
              body: 'Monte Carlo localization spreads particles, each a guess of the pose, across the map. When the robot moves, every particle moves with added noise. When a LiDAR scan arrives, each particle is weighted by how well the scan would match the map from its pose. Resampling keeps the likely particles, and the cloud converges on the true pose. ROS 2 Nav2 uses this method (AMCL).',
            },
            {
              heading: 'Other approaches',
              body: 'Outdoors, GNSS (GPS) gives global position to a few metres, or centimetres with RTK correction. Visual localization matches camera features against a map. Fiducial markers and UWB beacons provide simple, precise indoor positions in structured spaces.',
            },
          ],
          keyTerms: [
            ['Pose estimate', 'Best estimate of position and orientation, with uncertainty.'],
            ['Particle filter', 'Represents a probability distribution with many weighted samples.'],
            ['AMCL', 'Adaptive Monte Carlo Localization.'],
            ['Kidnapped robot problem', 'Recovering when the robot is moved to an unknown pose.'],
          ],
          example:
            'A hospital delivery robot uses AMCL on a pre-built LiDAR map of the corridors and reports low confidence to staff if the map no longer matches, for example after furniture is moved.',
          practice:
            'In a ROS 2 simulation with Nav2, give the robot a wrong initial pose in RViz, drive it around, and watch the particle cloud converge. Note how long recovery takes in a long featureless corridor versus a cluttered room.',
          videoQuery: 'robot localization particle filter monte carlo localization AMCL explained',
        },
        {
          id: 'mapping-slam',
          title: 'Mapping and SLAM',
          minutes: 30,
          summary:
            'Simultaneous Localization and Mapping (SLAM) builds a map of an unknown environment while tracking the robot\'s pose within it. Maps can be 2D occupancy grids, 3D point clouds or sets of visual landmarks.',
          why: 'Robots deployed in new homes, warehouses or mines must build their own maps. SLAM is what made robot vacuums and autonomous mobile robots practical.',
          objectives: ['Describe occupancy grid maps.', 'Explain the chicken-and-egg problem SLAM solves.', 'Explain loop closure.'],
          sections: [
            {
              heading: 'Occupancy grids',
              body: 'An occupancy grid divides space into cells (for example 5 cm squares), each holding the probability that it is occupied. LiDAR beams mark cells along their path as free and the cell where they end as occupied. The map can then be used for localization and path planning.',
            },
            {
              heading: 'SLAM and loop closure',
              body: 'Mapping needs a known pose, and localization needs a known map; SLAM estimates both together. Errors accumulate as the robot explores, so when it recognises a place it visited before (loop closure), graph-based SLAM optimises the whole trajectory to make the map consistent. slam_toolbox is the common 2D SLAM package for ROS 2; visual SLAM uses camera features.',
            },
          ],
          keyTerms: [
            ['SLAM', 'Simultaneous localization and mapping.'],
            ['Occupancy grid', 'A grid map storing the probability each cell is occupied.'],
            ['Loop closure', 'Recognising a revisited place to correct accumulated error.'],
            ['Pose graph', 'Graph of robot poses and constraints, optimised in SLAM.'],
          ],
          example:
            'Many robot vacuums build a floor map on their first run, then use it for room-by-room cleaning and to resume where they left off after recharging.',
          practice:
            'Run slam_toolbox with a simulated robot, drive a loop around the environment, save the map, and compare the map before and after the loop closure.',
          videoQuery: 'SLAM explained occupancy grid loop closure robotics slam_toolbox',
        },
        {
          id: 'path-planning',
          title: 'Path planning: A*, Dijkstra and RRT',
          minutes: 35,
          summary:
            'Path planning finds a collision-free route from start to goal. Graph-search algorithms such as Dijkstra and A* work on grids; sampling-based planners such as RRT explore large or high-dimensional spaces, including robot arm configurations.',
          why: 'Planning turns a map and a goal into motion. Choosing and tuning the right planner determines whether a robot takes sensible routes, gets stuck, or moves too close to obstacles.',
          objectives: ['Trace A* on a small grid.', 'Explain admissible heuristics.', 'Choose between grid and sampling planners.'],
          sections: [
            {
              heading: 'Dijkstra and A*',
              body: 'Dijkstra expands the cheapest unexplored node first and finds the shortest path. A* adds a heuristic h(n) estimating the remaining cost and expands the node with the lowest f(n) = g(n) + h(n). If h never overestimates (for example straight-line distance), A* still finds the optimal path while exploring far fewer nodes.',
            },
            {
              heading: 'Sampling-based planning',
              body: 'RRT (Rapidly-exploring Random Tree) grows a tree towards random samples until it reaches the goal. It handles high-dimensional spaces, such as a seven-joint arm, where grids would be impossibly large. RRT* refines the path towards optimal over time. MoveIt uses such planners for manipulators.',
            },
            {
              heading: 'Costmaps',
              body: 'Real planners use costmaps: obstacles are inflated by the robot\'s radius plus a margin, and cells near obstacles cost more, so paths keep a comfortable distance instead of brushing past walls.',
            },
          ],
          keyTerms: [
            ['A*', 'Best-first graph search using cost so far plus a heuristic.'],
            ['Heuristic', 'An estimate of the remaining cost to the goal.'],
            ['RRT', 'Rapidly-exploring random tree, a sampling-based planner.'],
            ['Costmap', 'A grid of traversal costs including inflated obstacles.'],
          ],
          example:
            'A warehouse robot uses A* on a costmap to plan a global route between aisles, then a local planner adjusts its motion every 50 ms to avoid people who step into the aisle.',
          practice:
            'Implement A* in Python on a 20×20 grid with obstacles. Visualise expanded cells and the final path, then compare the number of expanded cells with Dijkstra (h = 0).',
          videoQuery: 'A star path planning algorithm robotics Dijkstra RRT explained',
        },
        {
          id: 'navigation-stack',
          title: 'Navigation and obstacle avoidance',
          minutes: 30,
          summary:
            'A navigation stack combines localization, a global planner, a local controller, costmaps and recovery behaviours to move a robot to a goal safely. In ROS 2 this is Nav2.',
          why: 'Moving reliably among real obstacles and people requires all the pieces working together, and most autonomous mobile robots in industry use this architecture.',
          objectives: ['Describe the layers of a navigation stack.', 'Explain local planners and dynamic obstacles.', 'Configure recovery behaviours.'],
          sections: [
            {
              heading: 'Global and local planning',
              body: 'The global planner computes a route on the full map. The local controller, such as DWB, Regulated Pure Pursuit or MPPI in Nav2, follows that route while reacting to obstacles detected right now, producing velocity commands many times per second. It respects the robot\'s speed and acceleration limits.',
            },
            {
              heading: 'Recovery and robustness',
              body: 'When the robot gets stuck, recovery behaviours try clearing the costmap, rotating in place, backing up or waiting. Speed limits and keep-out zones can be marked on maps. Good navigation degrades gracefully and asks for help instead of pushing against an obstacle.',
            },
          ],
          keyTerms: [
            ['Nav2', 'The ROS 2 navigation framework.'],
            ['Local planner', 'Produces short-term velocity commands that avoid obstacles.'],
            ['Recovery behaviour', 'An action taken when navigation is stuck.'],
            ['Keep-out zone', 'A map region the robot must never enter.'],
          ],
          example:
            'A hotel delivery robot plans a global route to a room, slows down in a speed-limited lobby zone, waits for the lift, and reroutes when a housekeeping cart blocks the corridor.',
          practice:
            'Using Nav2 in simulation, send navigation goals through a cluttered map, add an obstacle in the robot\'s path at runtime, and observe and record which recovery behaviours are triggered.',
          videoQuery: 'ROS 2 Nav2 navigation stack tutorial obstacle avoidance local planner costmap',
        },
        {
          id: 'behavior-trees',
          title: 'Decision-making with behaviour trees',
          minutes: 25,
          summary:
            'Behaviour trees organise complex robot behaviour as a tree of reusable tasks and conditions combined by sequence, fallback and parallel nodes. They scale better than large state machines and are used by Nav2 and many robotics companies.',
          why: 'As robots gain more skills, state machines grow tangled. Behaviour trees keep behaviour modular, readable and reactive to change.',
          objectives: ['Read a behaviour tree.', 'Explain sequence and fallback nodes.', 'Compare behaviour trees with state machines.'],
          sections: [
            {
              heading: 'How behaviour trees work',
              body: 'The tree is "ticked" from the root many times per second. Each node returns SUCCESS, FAILURE or RUNNING. A Sequence runs children in order until one fails ("do all of these"). A Fallback (Selector) tries children in order until one succeeds ("try these alternatives"). Leaves are conditions such as "battery low?" or actions such as "navigate to dock".',
            },
            {
              heading: 'Why they scale',
              body: 'Subtrees are reusable building blocks, and priorities are explicit in left-to-right order. Because the tree is re-ticked continuously, a higher-priority condition such as "battery critical" can interrupt a running task cleanly.',
            },
          ],
          keyTerms: [
            ['Behaviour tree', 'A hierarchical model of tasks and decisions.'],
            ['Sequence node', 'Succeeds only if all children succeed in order.'],
            ['Fallback node', 'Succeeds as soon as one child succeeds.'],
            ['Tick', 'One evaluation pass through the tree.'],
          ],
          example:
            'Nav2\'s default navigation is a behaviour tree: compute a path, follow it, and if that fails, fall back to a recovery sequence of clearing costmaps, spinning and waiting before trying again.',
          practice:
            'Design a behaviour tree for a security patrol robot that visits waypoints, investigates unusual sounds, and returns to charge when the battery is low. Draw it and explain the priority order.',
          videoQuery: 'behavior trees robotics explained sequence fallback BehaviorTree.CPP',
        },
      ],
      project: {
        title: 'Autonomous navigation in simulation',
        description: 'Map a simulated environment and make a robot autonomously patrol a list of waypoints.',
        deliverables: [
          'A SLAM-built map of the environment.',
          'Nav2 configured with tuned costmap inflation and speed limits.',
          'A behaviour tree or script that patrols waypoints and handles a blocked route.',
          'A short screen recording and a log of goal success rate over 10 patrols.',
        ],
      },
    },
    // ───────────────────────────────────────────── Module 9
    {
      id: 'hri',
      title: 'Human-Robot Interaction',
      level: 'Advanced',
      summary: 'Designing robots that people can understand, communicate with, trust appropriately and work alongside.',
      objectives: [
        'Choose interaction modalities for a robot.',
        'Describe collaborative robot operating modes.',
        'Apply principles of transparency, trust and ethics.',
      ],
      lessons: [
        {
          id: 'hri-fundamentals',
          title: 'Foundations of human-robot interaction',
          minutes: 25,
          summary:
            'Human-robot interaction (HRI) studies how people and robots communicate and work together. It combines engineering, psychology and design to make robot behaviour understandable, predictable and acceptable.',
          why: 'A technically excellent robot fails if people cannot understand it, do not trust it, or are uncomfortable around it. More and more robots now work among the public.',
          objectives: ['Describe the main interaction modalities.', 'Explain legibility and predictability of motion.', 'Plan a basic user study.'],
          sections: [
            {
              heading: 'Interaction modalities',
              body: 'Robots communicate through speech, screens, lights, sounds, gestures, gaze and motion itself. People command robots through apps, voice, gestures, physical guidance and teleoperation. Good design uses several channels, for example a light ring that shows the robot\'s intended direction plus a spoken warning.',
            },
            {
              heading: 'Legible motion',
              body: 'Legible motion makes a robot\'s intent obvious early, for example turning its head or body before moving, or slowing as it approaches people. Predictable, smooth and consistent movement helps people feel safe and coordinate with the robot.',
            },
            {
              heading: 'Evaluating with people',
              body: 'HRI is evaluated with users: define a task, measure performance (time, errors), and collect perceptions with questionnaires and interviews. Include diverse participants, such as older adults, children and people with disabilities, where the robot will meet them.',
            },
          ],
          keyTerms: [
            ['HRI', 'Human-robot interaction.'],
            ['Modality', 'A channel of communication such as speech, gesture or light.'],
            ['Legibility', 'How easily an observer can infer a robot\'s goal from its motion.'],
            ['User study', 'A structured evaluation of a system with real people.'],
          ],
          example:
            'Delivery robots on pavements signal their intent with lights and sounds, yield to pedestrians, and display a message when they need help crossing an obstacle.',
          practice:
            'Choose a robot that works near the public. List what it needs to communicate (intent, status, errors, requests for help) and design how it would communicate each one through at least two modalities.',
          videoQuery: 'human robot interaction introduction HRI design legible motion lecture',
        },
        {
          id: 'collaborative-robots',
          title: 'Collaborative robots (cobots)',
          minutes: 25,
          summary:
            'Collaborative robots are designed to share workspace with people. Collaborative operation relies on safety functions such as safety-rated monitored stop, hand guiding, speed and separation monitoring, and power and force limiting.',
          why: 'Cobots let small factories automate without full safety fencing and combine human dexterity with robot endurance, but only if the application is designed and validated correctly.',
          objectives: ['Describe the four collaborative operation methods.', 'Explain that applications, not robots, are collaborative.', 'Identify suitable cobot tasks.'],
          sections: [
            {
              heading: 'Four methods of collaboration',
              body: 'Safety-rated monitored stop: the robot stops while a person is in the shared space. Hand guiding: an operator moves the robot directly through an enabling device. Speed and separation monitoring: sensors track people and the robot slows or stops as they come closer. Power and force limiting: the robot is designed and limited so that any contact stays below harmful thresholds.',
            },
            {
              heading: 'The application is what is collaborative',
              body: 'A "collaborative robot" is only safe in a specific application. A cobot carrying a sharp knife, or moving fast at head height, can still injure people. Every collaborative application needs its own risk assessment, covered in Module 10.',
            },
          ],
          keyTerms: [
            ['Cobot', 'A robot designed for direct interaction with people in a shared workspace.'],
            ['Power and force limiting', 'Limiting contact forces and pressures to acceptable levels.'],
            ['Speed and separation monitoring', 'Adjusting robot speed based on distance to people.'],
            ['Hand guiding', 'Moving a robot by hand using an enabling device.'],
          ],
          example:
            'In a machine-tending cell, a cobot loads parts into a CNC machine. A laser scanner slows it when an operator approaches and stops it when they enter the shared area to inspect parts.',
          practice:
            'For three tasks (screwdriving, palletising heavy boxes, handing tools to a surgeon), choose the most suitable collaborative method and list two hazards that would remain.',
          videoQuery: 'collaborative robots cobots power and force limiting speed separation monitoring explained',
        },
        {
          id: 'trust-ethics',
          title: 'Trust, transparency and ethics',
          minutes: 25,
          summary:
            'People should trust robots exactly as much as their real reliability deserves. Transparency about what a robot can do, what it is doing and what data it collects supports appropriate trust, while ethical design considers privacy, fairness, accountability and social impact.',
          why: 'Over-trust leads people to ignore real risks; under-trust leaves useful robots unused. Ethical failures, such as privacy breaches and biased perception, can harm people and end products.',
          objectives: ['Explain calibrated trust.', 'Design transparency into robot behaviour.', 'Identify ethical risks in a robot product.'],
          sections: [
            {
              heading: 'Calibrated trust',
              body: 'Trust should match capability. Robots support this by showing confidence (for example "I am not sure this is your cup"), explaining failures, and handing control to people when uncertain. Systems that always appear confident encourage dangerous over-reliance.',
            },
            {
              heading: 'Ethics in practice',
              body: 'Cameras and microphones on robots collect personal data: minimise collection, process on the device where possible, and be open about it. Test perception across different skin tones, body types, clothing and mobility aids. Define who is accountable when the robot causes harm, and consider effects on jobs and dignity.',
            },
          ],
          keyTerms: [
            ['Calibrated trust', 'Trust that matches a system\'s real reliability.'],
            ['Transparency', 'Making a robot\'s capabilities, state and reasoning understandable.'],
            ['Privacy by design', 'Building data protection into a system from the start.'],
            ['Algorithmic bias', 'Systematic errors that disadvantage some groups.'],
          ],
          example:
            'A care robot that reminds residents to take medicine announces what it is doing, asks for confirmation, records only the event rather than video, and alerts staff instead of acting when something is unusual.',
          practice:
            'Write a one-page ethics review of a home robot with a camera: what data it collects, who could be harmed and how, and five design changes that reduce those risks.',
          videoQuery: 'robot ethics trust transparency human robot interaction lecture',
        },
      ],
      project: {
        title: 'Interaction design for a shared-space robot',
        description: 'Design the interaction layer for a robot that works among people, and test it with real users.',
        deliverables: [
          'A communication design covering intent, status, errors and requests for help.',
          'A prototype of at least one signal (lights, sounds, screen or motion), on hardware or in simulation.',
          'Feedback from at least three people, with the changes you made in response.',
        ],
      },
    },
    // ───────────────────────────────────────────── Module 10
    {
      id: 'safety',
      title: 'Robot Safety Engineering',
      level: 'Advanced',
      summary: 'How to make robots safe by design: risk assessment, standards, safety functions, electrical safety and verification.',
      objectives: [
        'Perform a structured risk assessment.',
        'Identify the key robot safety standards and what they cover.',
        'Design emergency stops, safeguarding and safe software.',
      ],
      lessons: [
        {
          id: 'risk-assessment',
          title: 'Hazards and risk assessment',
          minutes: 30,
          summary:
            'Risk assessment systematically identifies hazards, estimates risk from severity and probability, and reduces it using the hierarchy of controls: inherently safe design first, then safeguarding, then information for users. ISO 12100 defines this process for machinery.',
          why: 'Safety is engineered, not added at the end. A documented risk assessment is required for placing machinery on the market in many regions, and it is the basis of every other safety decision.',
          objectives: ['Identify mechanical, electrical and other hazards.', 'Estimate and rank risks.', 'Apply the hierarchy of risk reduction.'],
          sections: [
            {
              heading: 'Identifying hazards',
              body: 'Consider every phase of the robot\'s life, including transport, installation, programming, normal use, maintenance, cleaning and disposal. Typical hazards include crushing, shearing and impact from moving parts; dropped payloads; electrical shock; stored energy in springs, batteries and pneumatics; heat; noise; and unexpected start-up.',
            },
            {
              heading: 'Estimating and reducing risk',
              body: 'Risk combines the severity of possible harm with its probability, which depends on exposure, the chance of the hazardous event, and the possibility of avoiding it. Reduce risk in order: first eliminate or reduce the hazard by design (lower speed, less force, rounded edges); then add safeguards (fences, light curtains, scanners); finally give information (warnings, training, manuals). Repeat until the remaining risk is acceptable.',
            },
          ],
          keyTerms: [
            ['Hazard', 'A potential source of harm.'],
            ['Risk', 'Combination of the severity and probability of harm.'],
            ['ISO 12100', 'International standard for machinery risk assessment and risk reduction.'],
            ['Residual risk', 'Risk remaining after protective measures are applied.'],
          ],
          example:
            'For a palletising cell, the assessment finds a crushing hazard between the robot and the pallet. The design lowers speeds, adds a fence with an interlocked gate and an area scanner at the pallet opening, and documents the residual risk for maintenance work.',
          practice:
            'Perform a risk assessment for your rover or a desktop robot arm. Make a table of at least eight hazards with severity, probability, risk level, the control measure chosen and the residual risk.',
          videoQuery: 'machine risk assessment ISO 12100 hierarchy of controls robotics safety',
        },
        {
          id: 'safety-standards',
          title: 'Safety standards for robots',
          minutes: 25,
          summary:
            'International standards encode decades of safety experience. Key ones include ISO 10218 for industrial robots and robot systems, ISO/TS 15066 for collaborative applications, ISO 13849 and IEC 62061 for safety-related control systems, ISO 13482 for personal care robots, and ISO 3691-4 for driverless industrial trucks and mobile robots.',
          why: 'Standards tell you what "safe enough" means, are recognised by regulators and customers, and save you from rediscovering hazards the hard way.',
          objectives: ['Name the main robot safety standards and their scope.', 'Explain performance levels (PL) and safety integrity levels (SIL).', 'Know how to find and apply the right standard.'],
          sections: [
            {
              heading: 'The main standards',
              body: 'ISO 10218-1 covers the industrial robot itself and ISO 10218-2 covers the robot system and its integration; the 2025 edition of ISO 10218 incorporates much of the collaborative guidance previously published in ISO/TS 15066, including body-region force and pressure limits. ISO 13482 addresses personal care robots, and ISO 3691-4 addresses driverless industrial trucks, which includes many AMRs. IEC 60204-1 covers the electrical equipment of machines.',
            },
            {
              heading: 'Functional safety',
              body: 'Safety functions, such as an emergency stop or a speed limit, must keep working even when components fail. ISO 13849-1 rates them by Performance Level from PL a (lowest) to PL e (highest); IEC 62061 uses Safety Integrity Levels (SIL). The required level comes from the risk assessment. Industrial robot safety functions are commonly required to meet PL d.',
            },
            {
              heading: 'Using standards',
              body: 'Standards are updated over time, so always check the current edition and the regulations that apply in your market, for example the machinery regulations in the EU. Treat them as engineering requirements to design and verify against, not paperwork to fill in at the end.',
            },
          ],
          keyTerms: [
            ['ISO 10218', 'Safety requirements for industrial robots (part 1) and robot systems and integration (part 2).'],
            ['ISO/TS 15066', 'Technical specification for collaborative robot applications.'],
            ['Performance Level (PL)', 'ISO 13849-1 measure of a safety function\'s reliability, from a to e.'],
            ['Functional safety', 'Safety that depends on control systems working correctly.'],
          ],
          example:
            'A cobot integrator verifies that the robot\'s power and force limiting keeps contact forces in each body region below the limits in the standard, measuring them with a force-pressure gauge at the actual hazard points.',
          practice:
            'For an AMR in a warehouse and a cobot screwdriving cell, list which standards apply and which safety functions each needs, with the reason for each.',
          videoQuery: 'robot safety standards ISO 10218 ISO 13849 performance level functional safety explained',
        },
        {
          id: 'safety-functions',
          title: 'Emergency stops, safeguarding and safe states',
          minutes: 25,
          summary:
            'Safety functions bring a robot to a safe state when needed. Emergency stops, protective stops, enabling devices, interlocked guards, light curtains and laser scanners are combined so that danger is detected and stopped reliably, independently of normal software.',
          why: 'When something goes wrong, these functions are the last line of defence. They must work every time, even if the main computer has crashed.',
          objectives: ['Explain stop categories 0, 1 and 2.', 'Design an emergency-stop circuit that is independent of software.', 'Choose safeguarding devices.'],
          sections: [
            {
              heading: 'Stop categories',
              body: 'IEC 60204-1 defines three stop categories. Category 0: remove power immediately (uncontrolled stop). Category 1: brake under control, then remove power. Category 2: controlled stop with power maintained, used for protective stops that must resume quickly. Emergency stops are category 0 or 1.',
            },
            {
              heading: 'Designing the emergency stop',
              body: 'An emergency-stop button (ISO 13850) is red on a yellow background, latches when pressed, and must be reset deliberately. It should cut motor power through a safety relay or safety controller, not by asking software to stop. Use normally-closed contacts so that a broken wire also triggers a stop (fail-safe design).',
            },
            {
              heading: 'Safeguarding',
              body: 'Fixed guards keep people out. Interlocked doors stop the robot when opened. Light curtains and safety laser scanners detect people entering zones and trigger slowing or stopping. Enabling devices, three-position switches, let a person move a robot during teaching only while holding the middle position.',
            },
          ],
          keyTerms: [
            ['Emergency stop', 'A manually initiated function that stops hazardous motion.'],
            ['Safety relay', 'A certified relay module that monitors safety inputs and cuts power reliably.'],
            ['Fail-safe', 'A design whose failures lead to a safe state.'],
            ['Enabling device', 'A three-position switch permitting motion only when held in the middle.'],
          ],
          example:
            'A mobile robot has emergency-stop buttons on each side wired through a safety relay that cuts motor power and engages brakes. Its safety laser scanner switches between warning and stop fields based on speed.',
          practice:
            'Draw an emergency-stop circuit for your rover: a latching normally-closed button that cuts motor power through a relay or contactor while the microcontroller stays powered to log the event. Explain what happens if the button wire breaks.',
          videoQuery: 'emergency stop circuit safety relay stop category 0 1 2 robot safeguarding',
        },
        {
          id: 'safe-software',
          title: 'Electrical, battery and software safety',
          minutes: 25,
          summary:
            'Beyond moving parts, robots carry electrical, battery and software hazards. Proper protection, watchdogs, input validation, safe defaults, cybersecurity and systematic testing keep these risks under control.',
          why: 'Software now controls almost everything a robot does. A missing timeout or unvalidated command can turn a bug into an accident, and a connected robot can be attacked remotely.',
          objectives: ['Apply electrical and battery protection.', 'Design software that fails safe.', 'Test robot software systematically.'],
          sections: [
            {
              heading: 'Electrical and battery safety',
              body: 'Fuse every power branch near its source, size wires for the current, insulate exposed conductors, and provide strain relief. Above extra-low voltage levels, follow electrical safety regulations and use qualified people. Store and charge lithium batteries according to the manufacturer\'s guidance, with a BMS and fire-safe containment.',
            },
            {
              heading: 'Software that fails safe',
              body: 'Stop motors when commands time out (watchdogs). Validate and limit every command: maximum speed, acceleration and joint range. Start in a safe state after reset. Log faults. Never rely on general-purpose software alone for safety functions; use certified safety hardware for those.',
            },
            {
              heading: 'Testing and security',
              body: 'Use unit tests for algorithms, simulation tests for behaviours, hardware-in-the-loop tests for drivers, and staged field tests at reduced speed. Secure robot networks with authentication and encryption, change default passwords, and keep software updated; IEC 62443 covers industrial cybersecurity.',
            },
          ],
          keyTerms: [
            ['Safe state', 'A condition in which the robot cannot cause harm, usually stopped with power removed.'],
            ['Command timeout', 'Stopping when control messages stop arriving.'],
            ['Hardware-in-the-loop', 'Testing software against real hardware components.'],
            ['IEC 62443', 'A series of standards for industrial automation cybersecurity.'],
          ],
          example:
            'After a Wi-Fi drop, a teleoperated robot\'s microcontroller detects that no velocity command has arrived for 300 ms and ramps its motors to zero, instead of continuing at its last commanded speed.',
          practice:
            'Review your rover\'s code from earlier modules. Add a command timeout, speed and acceleration limits, and a safe start-up state. Write a test that proves the motors stop when commands stop.',
          videoQuery: 'robot software safety watchdog fail safe design testing robotics cybersecurity',
        },
      ],
      project: {
        title: 'Safety case for your robot',
        description: 'Produce a safety case for the rover or robot you have built through this track.',
        deliverables: [
          'A risk assessment table with controls and residual risks.',
          'A working, software-independent emergency-stop circuit.',
          'Software safety features (timeouts, limits, safe start-up) with tests that prove them.',
          'A one-page summary of the standards you would follow to make it a product.',
        ],
      },
    },
    // ───────────────────────────────────────────── Module 11
    {
      id: 'capstone',
      title: 'Capstone Engineering Projects',
      level: 'Project',
      summary: 'Integrate everything into complete robots and a portfolio that demonstrates real engineering skill.',
      objectives: [
        'Plan and run a robotics project from requirements to demonstration.',
        'Integrate mechanics, electronics, software, AI and safety.',
        'Document and present engineering work professionally.',
      ],
      lessons: [
        {
          id: 'engineering-process',
          title: 'The robotics engineering process',
          minutes: 25,
          summary:
            'Real robots are built through an iterative engineering process: define requirements, design the architecture, build and test incrementally, integrate, verify against requirements, and document. The capstone projects follow this process.',
          why: 'Employers value engineers who can deliver working systems, not only understand components. Process is what turns knowledge into reliable results.',
          objectives: ['Write measurable requirements.', 'Plan incremental milestones.', 'Document a project for a portfolio.'],
          sections: [
            {
              heading: 'Requirements and architecture',
              body: 'Write requirements that can be tested: "follow a 2 cm black line at 0.3 m/s with less than 1 cm deviation" rather than "follow lines well". Draw the system architecture: subsystems, interfaces, power and data flows. Identify the riskiest parts and prototype them first.',
            },
            {
              heading: 'Build, test, integrate',
              body: 'Build in thin vertical slices that work end to end, then improve them. Test each subsystem alone before integrating. Keep code in version control (Git), log data from every test, and record decisions and failures in an engineering notebook. This Academy\'s Error Archive and Workflows are a good place for that.',
            },
            {
              heading: 'Portfolio',
              body: 'For each project, publish a short write-up: problem, requirements, design, key decisions, test results with numbers, video, and lessons learned. Honest analysis of failures impresses reviewers more than polished videos alone.',
            },
          ],
          keyTerms: [
            ['Requirement', 'A testable statement of what the system must do.'],
            ['Integration', 'Combining subsystems into a working whole.'],
            ['Verification', 'Proving the system meets its requirements.'],
            ['Milestone', 'A checkpoint with a demonstrable result.'],
          ],
          example:
            'A student team building a pick-and-place arm first prototypes the gripper on a single servo, then the vision pipeline on recorded images, and only then integrates them, keeping a demo-able system at every milestone.',
          practice: 'Choose your capstone project. Write ten measurable requirements, an architecture diagram, and a plan of four milestones, each ending with something you can demonstrate.',
          videoQuery: 'robotics project engineering design process requirements integration testing',
        },
        {
          id: 'capstone-line-follower',
          title: 'Project 1: Smart line-following robot',
          minutes: 60,
          summary:
            'Build a two-wheel robot that follows a line using reflectance sensors and PID steering, detects obstacles, and stops safely. This project integrates Modules 1–6 and 10.',
          why: 'A line follower is small enough to finish but exercises the full stack: mechanics, power, sensing, embedded code, feedback control and safety.',
          objectives: ['Integrate sensors, motors and control on one robot.', 'Tune PID steering for speed and accuracy.', 'Add safety and obstacle handling.'],
          sections: [
            {
              heading: 'Build',
              body: 'Use a two-wheel chassis with geared DC motors and encoders, a dual motor driver, an array of three to eight infrared reflectance sensors, an ultrasonic or time-of-flight distance sensor, a fused 2S battery, a power switch and an emergency-stop button.',
            },
            {
              heading: 'Software',
              body: 'Calibrate the sensor array, compute a line position from −1 to +1 as a weighted average, and use PID to convert the position error into a steering difference between the wheels. Add a state machine: FOLLOW, OBSTACLE_STOP, LINE_LOST_SEARCH and STOPPED, plus a command watchdog and speed limit.',
            },
            {
              heading: 'Verification',
              body: 'Measure lap time and maximum deviation on a test track, test obstacle stopping distance at several speeds, and verify that the emergency stop cuts motor power with the microcontroller still running.',
            },
          ],
          keyTerms: [
            ['Reflectance sensor', 'An infrared emitter and detector that measures surface brightness.'],
            ['Weighted average', 'A position estimate from several sensors weighted by their readings.'],
            ['Stopping distance', 'Distance travelled between detecting an obstacle and standing still.'],
            ['Test track', 'A repeatable course for measuring performance.'],
          ],
          example:
            'A well-tuned hobby line follower can lap a short track at well over 1 m/s; the fastest competition robots add suction fans for grip and look-ahead sensor arrays.',
          practice: 'Build the robot, log line position and motor commands, and tune until it completes ten consecutive laps. Publish your results with lap times and a video.',
          videoQuery: 'PID line follower robot build tutorial arduino',
        },
        {
          id: 'capstone-autonomous-rover',
          title: 'Project 2: Autonomous ROS 2 rover',
          minutes: 90,
          summary:
            'Build or simulate a differential-drive robot running ROS 2 that maps an indoor space with SLAM, localises, and navigates autonomously to goals while avoiding obstacles. This project integrates Modules 4–8 and 10.',
          why: 'This is the architecture of real autonomous mobile robots in warehouses, hospitals and homes, and the most requested skill set in mobile robotics jobs.',
          objectives: ['Build a complete ROS 2 robot system.', 'Run SLAM and Nav2 on real or simulated hardware.', 'Evaluate autonomous performance quantitatively.'],
          sections: [
            {
              heading: 'System',
              body: 'Hardware option: a single-board computer running ROS 2, a 2D LiDAR, an IMU, and a microcontroller handling motors and encoders over serial or micro-ROS. Simulation option: a URDF model in Gazebo with the same topics. Both publish /scan, /odom and tf, and accept /cmd_vel.',
            },
            {
              heading: 'Autonomy',
              body: 'Fuse odometry and IMU with robot_localization, map with slam_toolbox, then navigate with Nav2 using AMCL on the saved map. Tune costmap inflation, speed limits and the local controller. Add a behaviour tree or script for a multi-goal mission with recovery.',
            },
            {
              heading: 'Evaluation',
              body: 'Report goal success rate, average time to goal, minimum clearance from obstacles, and localization error at marked points. Include a risk assessment and safety features: emergency stop, speed limits near people, and a command timeout.',
            },
          ],
          keyTerms: [
            ['micro-ROS', 'ROS 2 for microcontrollers.'],
            ['robot_localization', 'A ROS 2 package for sensor fusion with EKF and UKF.'],
            ['Mission', 'A sequence of goals the robot completes autonomously.'],
            ['Clearance', 'Distance kept between the robot and obstacles.'],
          ],
          example:
            'A finished rover maps a flat, then autonomously visits each room on command from a phone, returning to a charging spot, which is the core of a commercial home robot.',
          practice: 'Complete the rover in simulation first, then on hardware if available. Document 20 navigation trials with success rate and failure causes.',
          videoQuery: 'ROS 2 autonomous robot SLAM Nav2 project build from scratch',
        },
        {
          id: 'capstone-vision-arm',
          title: 'Project 3: Vision-guided pick-and-place arm',
          minutes: 90,
          summary:
            'Build or simulate a robot arm that uses a camera and an object detector to find objects, computes inverse kinematics, and picks and sorts them, with a safety design suitable for working near people. This project integrates Modules 2, 4, 5, 7, 9 and 10.',
          why: 'Vision-guided manipulation is the core of modern automation in logistics, manufacturing and recycling, and combines AI with precise mechanical control.',
          objectives: ['Calibrate a camera to robot coordinates.', 'Combine AI perception with kinematics and grasping.', 'Design safe, legible interaction with people.'],
          sections: [
            {
              heading: 'Perception to action',
              body: 'Mount a camera above the workspace and calibrate the mapping from pixels to robot coordinates using markers. Detect objects with a colour threshold or a fine-tuned detector, compute grasp points, solve inverse kinematics, and execute approach, grasp, lift and place motions.',
            },
            {
              heading: 'Safety and interaction',
              body: 'Limit speed and force, define a safe working envelope, add an emergency stop, and signal the robot\'s state with a light (idle, moving, error). Pause when a hand enters the workspace, using the camera or a distance sensor.',
            },
            {
              heading: 'Evaluation',
              body: 'Measure pick success rate across 50 attempts with varied object positions, average cycle time, and placement accuracy. Analyse failures by cause: detection, calibration, kinematics or grasp.',
            },
          ],
          keyTerms: [
            ['Hand-eye calibration', 'Finding the transform between camera and robot frames.'],
            ['Grasp point', 'The position and orientation at which the gripper should close.'],
            ['Cycle time', 'Time to complete one full pick-and-place.'],
            ['Working envelope', 'The restricted region in which the robot is allowed to move.'],
          ],
          example:
            'A low-cost desktop arm with a webcam sorts coloured blocks into bins at a few picks per minute, which is a practical demonstration of the same pipeline used in industrial bin picking.',
          practice: 'Complete the arm, run 50 picks, and publish a report with success rate, cycle time, failure analysis and your safety case.',
          videoQuery: 'vision guided pick and place robot arm project camera calibration inverse kinematics',
        },
      ],
      project: {
        title: 'Engineering portfolio',
        description: 'Publish your capstone work as a professional portfolio.',
        deliverables: [
          'At least one completed capstone project with requirements, design, test data and video.',
          'A safety case and risk assessment for that project.',
          'A reflection on what you would change in a second version.',
        ],
      },
    },
  ],
};
