const container = document.getElementById('container');
container.style.backgroundColor = 'black';

// Box2D setup
const b2Vec2 = Box2D.Common.Math.b2Vec2;
const b2BodyDef = Box2D.Dynamics.b2BodyDef;
const b2Body = Box2D.Dynamics.b2Body;
const b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
const b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
const world = new Box2D.Dynamics.b2World(new b2Vec2(0, 9.8)); // Apply gravity

// Create the cube body
const cubeSize = 100; // Adjust cube size here (meters in Box2D)
const cubeBodyDef = new b2BodyDef();
cubeBodyDef.type = b2Body.b2_dynamicBody;
cubeBodyDef.position.Set(container.clientWidth / 2 / 100, container.clientHeight / 2 / 100); // Convert pixels to meters

const cubeFixtureDef = new b2FixtureDef();
cubeFixtureDef.density = 1.0;
cubeFixtureDef.friction = 0.5;
cubeFixtureDef.shape = new b2PolygonShape();
cubeFixtureDef.shape.SetAsBox(cubeSize / 2 / 100, cubeSize / 2 / 100); // Half width and half height for centered box

const cubeBody = world.CreateBody(cubeBodyDef);
cubeBody.CreateFixture(cubeFixtureDef);

// Update loop (using requestAnimationFrame for smooth animation)
let lastTimestamp = null;
function update() {
  if (!lastTimestamp) {
    lastTimestamp = performance.now();
    return;
  }
  const dt = (performance.now() - lastTimestamp) / 1000;
  lastTimestamp = performance.now();

  world.Step(dt, 10, 10); // Update physics simulation

  // Update cube position on screen based on Box2D physics
  const position = cubeBody.GetPosition();
  const cubeElement = document.getElementById('cube');
  cubeElement.style.left = position.x * 100 + 'px'; // Convert meters back to pixels
  cubeElement.style.top = container.clientHeight - position.y * 100 + 'px'; // Invert y-axis for screen coordinates

  requestAnimationFrame(update);
}
requestAnimationFrame(update);

// Drag functionality (uses Box2D mouse joint)
let isDragging = false;
let mouseJoint = null;

container.addEventListener('mousedown', (event) => {
  const mousePos = new b2Vec2(event.clientX / 100, container.clientHeight / 100 - event.clientY / 100); // Invert y-axis

  const bodyDef = new b2BodyDef();
  bodyDef.type = b2Body.b2_staticBody;
  bodyDef.position.Set(mousePos.x, mousePos.y);
  const tempBody = world.CreateBody(bodyDef);

  const jointDef = new Box2D.Dynamics.Joints.b2MouseJointDef();
  jointDef.target = cubeBody;
  jointDef.bodyA = tempBody;
  jointDef.maxForce = 1000.0;
  jointDef.collideConnected = true;
  mouseJoint = world.CreateJoint(jointDef);

  isDragging = true;
});

document.addEventListener('mouseup', () => {
  if (mouseJoint) {
    world.DestroyJoint(mouseJoint);
    mouseJoint = null;
  }
  isDragging = false;
});

container.addEventListener('mousemove', (event) => {
  if (mouseJoint) {
    const mousePos = new b2Vec2(event.clientX / 100, container.clientHeight / 100 - event.clientY / 100);
    mouseJoint.SetTarget(mousePos);
  }
});
