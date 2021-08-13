import { contain, interset } from "./bound_box";
import { nodeForEach as TreeNodeForEach } from "./tree";
// import { createEnity } from "./entity";

const createNode = (boundBox, parent = null) => ({
  boundBox,
  parent: null,
  entities: [],
  children: [],
});
const nodeSplit = (node) => {
  const { boundBox, entities, children } = node;
  globalThis.$debug?.(() => {
    const badArgs = false;
    const [left, right, top, bottom] = boundBox;
    if (left > right || top < bottom) badArgs = true;
    if (children.length !== 0) badArgs = true;
    if (badArgs) {
      console.error(`nodeSplit(...): bad arguments: {${boundBox}}`);
    }
  });
  const [left, right, top, bottom] = boundBox;
  const midX = Math.trunc((left + right) / 2);
  const midY = Math.trunc((top + bottom) / 2);
  const topLeft = [left, midX, midY, top];
  const topRight = [midX, right, midY, top];
  const bottomLeft = [left, midX, bottom, midY];
  const bottomRight = [midX, right, bottom, midY];

  children.push(
    createNode(topLeft, node),
    createNode(topRight, node),
    createNode(bottomLeft, node),
    createNode(bottomRight, node)
  );

  for (let i = entities.length - 1; i >= 0; i--) {
    const entity = entities[i];
    const entityboundBox = tree.getboundBoxOf(entity);
    const node = children.find((node) =>
      contain(node.boundBox, entityboundBox)
    );
    if (node) {
      tree.onWillUnmount?.(enitity, containerNode);
      entities.splice(i, 1);
      node.entities.push(entity);
      tree.onMounted?.(enitity, containerNode);
    }
  }
};

const create = ({
  boundBox,
  splitThreshold = 10,
  minWidthOfSplit = 4,
  minHeightOfSplit = 4,
  getboundBoxOf = (e) => e.boundBox,      // this function will be called offen inside, should be effecient
  onMounted = (e, node) => {              // try cache the quadNode of an entity on it's cache property to reference back to it's boundBox node
    e.cache?._QuadTreeNode = node;         
  },
  onWillUnmount = (e, node) => {
    e.cache?._QuadTreeNode = undefined;
  },
}) => {
  globalThis.$debug?.(() => {
    let badArgs = false;
    if (!boundBox) {
      badArgs = true;
    } else {
      const [left, right, top, bottom] = boundBox;
      if (left > right || top < bottom) badArgs = true;
    }
    if (badArgs) {
      console.error(`create(...): bad arguments: {${boundBox}}`);
    }
  });
  return {
    splitThreshold,
    minWidthOfSplit,
    minHeightOfSplit,
    getboundBoxOf,  
    onMounted,
    onWillUnmount,
    root: nodeSplit(createNode(boundBox)),
  };
};

const findContainerNode = (tree, enitity, cueNode = null) => {
  let containerNode;
  const bonndBox = tree.getboundBoxOf(enitity);
  if (cueNode) {
    const node = cueNode;
    while (!contain(node.boundBox, bonndBox)) {
      node = node.parent;
      if (node == null) {
        return tree.root;
      }
    }
    containerNode = node;
  } else {
    if (!contain(tree.root.boundBox, bonndBox)) {
      return tree.root;
    }
    containerNode = tree.root;
  }
  while (true) {
    const result = containerNode.children.find((node) =>
      contain(node.boundBox, boundBox)
    );
    if (!result) break;
    containerNode = result;
  }
  return containerNode;
};
const add = (tree, enitity, cueNode = null) => {
  const containerNode = findContainerNode(tree, enitity, (cueNode = null));
  containerNode.entities.push(entity);
  tree.onMounted?.(enitity, containerNode);
  if (
    containerNode.entities.length > tree.splitThreshold &&
    containerNode.children.length == 0
  ) {
    const { l, r, t, b } = containerNode.boundBox;
    if (r - l >= tree.minWidthOfSplit && t - b >= tree.minHeightOfSplit) {
      nodeSplit(containerNode);
    }
  }
};

const remove = (tree, enitity, cueNode = null) => {
  const containerNode = findContainerNode(tree, enitity, (cueNode = null));
  const i = containerNode.entities.findIndex(entity);
  if (i == -1) {
    return false;
  }
  tree.onWillUnmount?.(enitity, containerNode);
  entities.splice(i, 1);
  return true;
};

const findInterSects = (tree, enitity, cueNode = null) => {
  const containerNode = findContainerNode(tree, enitity, (cueNode = null));
  const boundBox = getboundBoxOf(entity);
  const InterSects = [];
  TreeNodeForEach(containerNode, (node) => {
    node.entities.forEach((e) => {
      if (interset(boundBox, getboundBoxOf(e))) {
        InterSects.push();
      }
    });
  });
  while (containerNode.parent != null) {
    containerNode = containerNode.parent;
    containerNode.entities.forEach((e) => {
      if (interset(boundBox, getboundBoxOf(e))) {
        InterSects.push();
      }
    });
  }
  return InterSects;
};

const forEachInterSectPair = (treeOrNode, callBack = console.log.bind(console)) => {
  const baseNode = treeOrNode.root || treeOrNode;
  const enitities = baseNode.enitities;
 
  for (let i = enitities.length - 1; i >= 0; i--) {
    const entity1 = entities[i];
    for (let j = i - 1; j >= 0; j--) {      
      const entity2 = entities[j];     
      if (interset(getboundBoxOf(entity1), getboundBoxOf(entity2))) {
        callBack(entity1, entity2);
      }
    }
    this.children.forEach(baseNode => {
      TreeNodeForEach(baseNode, node => {
        node.enitities.forEach(entity2 => {
          if (interset(getboundBoxOf(entity1), getboundBoxOf(entity2))) {
            callBack(entity1, entity2);
          };
        });
      });
      forEachInterSectPair(baseNode, callBack);
    });
   
  }
  const boundBox = getboundBoxOf(entity);
  const InterSects = [];
  TreeNodeForEach(containerNode, (node) => {
    node.entities.forEach((e) => {
      if (interset(boundBox, getboundBoxOf(e))) {
        InterSects.push();
      }
    });
  });
};

export default {
  create,
  add,
  remove,
  findInterSects,
  forEachInterSectPair,
};
