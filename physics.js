import { forEachInterSectPair } from "./quad_tree";

const step = (quadTree, time = 17) => {
  const collidePairs = [];
  forEachInterSectPair(quadTree, (enity1, entity2) => {
    collidePairs.push([enity1, entity2]);
  });
};

export { step };
