import { EntityActions } from '@ngneat/elf';
import {
  createEntitiesStore,
  createTodo,
  createUIEntityStore,
  createUITodo,
  toMatchSnapshot,
} from '@ngneat/elf-mocks';
import { UIEntitiesRef } from './entity.state';
import { setEntities, setEntitiesMap } from './set.mutation';

describe('set', () => {
  let store: ReturnType<typeof createEntitiesStore>;

  beforeEach(() => {
    store = createEntitiesStore();
  });

  it('should set entities', () => {
    store.update(setEntities([createTodo(1)]));
    toMatchSnapshot(expect, store, 'set one');

    store.update(setEntities([createTodo(2)]));
    toMatchSnapshot(expect, store, 'set one');
  });

  it('should send set entity action', (done) => {
    store.actions$.subscribe((data) => {
      expect(data).toStrictEqual({ type: EntityActions.Set, ids: [1, 10] });
      done();
    });

    store.update(setEntities([createTodo(1), createTodo(10)]));
  });

  it('should set entities in key-value structure', () => {
    store.update(
      setEntitiesMap({
        1: createTodo(1),
      })
    );
    toMatchSnapshot(expect, store, 'set one');

    store.update(
      setEntitiesMap({
        2: createTodo(2),
      })
    );
    toMatchSnapshot(expect, store, 'set one');
  });

  it('should set entities work with ref', () => {
    const store = createUIEntityStore();
    store.update(setEntities([createUITodo(1)], { ref: UIEntitiesRef }));
    toMatchSnapshot(expect, store, 'set one');

    store.update(setEntities([createUITodo(2)], { ref: UIEntitiesRef }));
    toMatchSnapshot(expect, store, 'set one');
  });
});
