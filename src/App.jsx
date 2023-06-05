import * as React from 'react';

const useStorageState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
}

const initialStories = [
  {
    title: 'React',
    url: 'https://reactjs.org',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: 'Redux',
    url: 'https://redux.js.org',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
  },
];

const getAsyncStories = () => 
  new Promise((resolve) => 
  setTimeout(
      () => resolve({data: {stories: initialStories}}),
      2000
    )
  );

const SET_STORIES ='SET_STORIES';
const REMOVE_STORY = 'REMOVE_STORY'
const storiesReducer = (state, action) => {
  switch (action.type) {
    case SET_STORIES:
      return action.payload;
    case REMOVE_STORY:
      return state.filter(
        (story) => action.payload.objectID !== story.objectID
      );
    default:
      throw new Error();
  }
}

const App = () => {
  const [searchTerm, setSearchTerm] = useStorageState('search', 'React');

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    {data: [], isLoading: false, isError: false}
  );

  React.useEffect(() => {
    dispatchStories({type: 'STORIES_FETCH_INIT'});

    getAsyncStories()
    .then(result => {
      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.stories,
      });
    }).catch(() => 
      dispatchStories({type: 'STORIES_FETCH_FAILURE'})
    );
  }, []);

  const handleRemoveStory = (item) => {
    dispatchStories({
      type: REMOVE_STORY,
      payload: item,
    });
  }

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  }

  const searchedStories = stories.filter((story) => {
    return story.title.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  return (
    <div>
      <h1>
        My Hacker Stories
      </h1>
      <InputWithLabel id="search" value={searchTerm} isFocused onInputChange={handleSearch}>
        <strong>Search:</strong>
      </InputWithLabel>
      <hr />
      {isError && <p>Something went wrong...</p>}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <List list={searchedStories} onRemoveItem={handleRemoveStory} />
      )}
    </div>
  );
}

const InputWithLabel = ({id, value, type='text', onInputChange, isFocused, children}) => {
  const inputRef = React.useRef();

  React.useEffect(() => {
    if(isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
  <>
    <label htmlFor={id}> {children}
      <input ref={inputRef} id={id} type={type} value={value} onChange={onInputChange} />
    </label>
  </>
);
}

const List = ({list, onRemoveItem}) => (
  <ul>
    {list.map(item => <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />)}
  </ul>
);

const Item = ({item, onRemoveItem}) => (
  <li key={item.objectID}>
    <span>
      <a href={item.url}>{item.title}</a>
    </span>
    <span>by {item.author}</span>
    <span>Number of Comments: {item.num_comments}</span>
    <span>Points: {item.points}</span>
    <span>
      <button type="button" onClick={() => onRemoveItem(item)}>Dismiss</button>
    </span>
  </li>
);

export default App;
