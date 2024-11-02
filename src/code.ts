figma.showUI(__html__, { width: 400, height: 500 });

interface FlowStep {
  text: string;
  x: number;
  y: number;
}

function createFlowNode(step: FlowStep) {
  const node = figma.createFrame();
  node.resize(200, 100);
  node.x = step.x;
  node.y = step.y;
  node.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  node.strokeWeight = 1;
  node.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
  node.cornerRadius = 8;

  const text = figma.createText();
  text.characters = step.text;
  text.fontSize = 14;
  text.textAlignHorizontal = 'CENTER';
  text.textAlignVertical = 'CENTER';
  text.resize(180, 80);
  text.x = 10;
  text.y = 10;

  node.appendChild(text);
  return node;
}

function createArrow(start: FlowStep, end: FlowStep) {
  const arrow = figma.createLine();
  arrow.x = start.x + 200;
  arrow.y = start.y + 50;
  arrow.resize(end.x - (start.x + 200), 0);
  arrow.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
  arrow.strokeWeight = 2;

  // Add arrow head
  const arrowHead = figma.createPolygon();
  arrowHead.resize(12, 12);
  arrowHead.x = end.x - 6;
  arrowHead.y = end.y + 44;
  arrowHead.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
  arrowHead.rotation = 90;

  return [arrow, arrowHead];
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'create-flow') {
    const requirements = msg.requirements.split('\n').filter(req => req.trim());
    
    // Load font
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    
    const flowSteps: FlowStep[] = requirements.map((req, i) => ({
      text: req,
      x: i * 300,
      y: 0
    }));

    const nodes = flowSteps.map(step => createFlowNode(step));
    
    // Create arrows between nodes
    const arrows = flowSteps.slice(0, -1).map((step, i) => 
      createArrow(step, flowSteps[i + 1])
    ).flat();

    // Group everything
    const group = figma.group([...nodes, ...arrows], figma.currentPage);
    group.name = "User Flow";

    figma.viewport.scrollAndZoomIntoView([group]);
  }

  figma.closePlugin();
};