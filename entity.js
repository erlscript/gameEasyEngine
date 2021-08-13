import { nanoid } from "nanoid";

const idGenerator = nanoid;

const createEntity = () => ({
  id: idGenerator(),
  caches: {},
});

export { createEntity };
