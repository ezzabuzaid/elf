import {
  addEntities,
  deleteEntities,
  selectAllEntities,
  UIEntitiesRef,
  updateEntities,
  withEntities,
  withUIEntities,
} from '@ngneat/elf-entities';
import {
  createEntitiesStore,
  createTodo,
  createUITodo,
  Todo,
} from '@ngneat/elf-mocks';
import { EntityActions, ofType } from '..';
import { withProps } from './props.state';
import { createState } from './state';
import { Store } from './store';

type UIEntity = { id: number; open: boolean };

describe('store', () => {
  it('should reset store', () => {
    const { state, config } = createState(
      withEntities<Todo>(),
      withProps<{ filter: string }>({ filter: '' })
    );

    const store = new Store({ state, name: 'todos', config });

    store.update(addEntities(createTodo(1)), (state) => ({
      ...state,
      filter: 'foo',
    }));

    expect(store.getValue()).toMatchSnapshot();

    store.reset();

    expect(store.getValue()).toMatchSnapshot();
  });

  it('should combine and fire only once', () => {
    const { state, config } = createState(
      withEntities<Todo>(),
      withUIEntities<UIEntity>(),
      withProps<{ filter: string }>({ filter: '' })
    );

    const store = new Store({ state, name: 'todos', config });

    const spy = jest.fn();

    store
      .combine({
        todos: store.pipe(selectAllEntities()),
        ui: store.pipe(selectAllEntities({ ref: UIEntitiesRef })),
      })
      .subscribe(spy);

    expect(spy).toHaveBeenCalledTimes(1);

    expect(store.getValue()).toMatchSnapshot();

    store.update(
      addEntities(createTodo(1)),
      addEntities(createUITodo(1), { ref: UIEntitiesRef })
    );

    expect(spy).toHaveBeenCalledTimes(2);
    expect(store.getValue()).toMatchSnapshot();

    store.update((state) => ({ ...state, filter: 'foo' }));

    // Update non related value should not call `next`
    expect(spy).toHaveBeenCalledTimes(2);

    store.update(updateEntities(1, { title: 'foo' }), (state) => ({
      ...state,
      filter: 'hello',
    }));

    expect(store.getValue()).toMatchSnapshot();
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it.each([
    [() => addEntities(createTodo(1)), { type: EntityActions.Add, ids: [1] }],
    [() => deleteEntities(1), { type: EntityActions.Remove, ids: [1] }],
  ])('should listen to multiple actions type', (actionFn, actionEvent) => {
    const store = createEntitiesStore();

    store.actions$
      .pipe(ofType([EntityActions.Add, EntityActions.Remove]))
      .subscribe((data) => {
        expect(data).toStrictEqual(actionEvent);
      });

    store.update(actionFn());
  });
});
