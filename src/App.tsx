import * as React from 'react';
import axios from 'axios';

type Story = {
  objectID: string;
  url: string;
  title: string;
  author: string;
  num_comments: number;
  points: number;
}

type Stories = Story[];

type StoriesState = {
  data: Stories;
  isLoading: boolean;
  isError: boolean;
}

type StoriesFetchInitAction = {
  type: 'STORIES_FETCH_INIT';
}

type StoriesFetchSuccessAction = {
  type: 'STORIES_FETCH_SUCCESS';
  payload: Stories
}

type StoriesFetchFaliureAction = {
  type: 'STORIES_FETCH_FAILURE';
}

type StoriesRemoveAction = {
  type: 'REMOVE_STORY';
  payload: Story;
}

type StoriesAction = 
  StoriesFetchInitAction
  | StoriesFetchSuccessAction
  | StoriesFetchFaliureAction
  | StoriesRemoveAction;

const storiesReducer = (
  state: StoriesState,
  action: StoriesAction
) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.objectID !== story.objectID
        ),
      };
    default:
      throw new Error();
  }
}

const useStorageState = (
  key: string,
  initialState: string
): [string, (newValue: string) => void] => {
  const isMounted = React.useRef(false);
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      console.log('A');
      localStorage.setItem(key, value);
    }

  }, [value, key]);

  return [value, setValue];
}

const getSumComments = (stories) => {
  console.log('C');

  return stories.data.reduce(
    (result, value) => result + value.num_comments,
    0
  );
}

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const App = () => {
  const [searchTerm, setSearchTerm] = useStorageState(
    'search',
    'React'
  );

  const [url, setUrl] = React.useState(
    `${API_ENDPOINT}${searchTerm}`
  );

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data: [], isLoading: false, isError: false }
  );

  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
      const result = await axios.get(url);

      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.hits,
      });
    } catch {
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
    }
  }, [url]);

  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const handleRemoveStory = React.useCallback((item: Story) => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  }, []);

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);

    event.preventDefault();
  }

  console.log('B:App');

  const sumComments = React.useMemo(
    () => getSumComments(stories),
    [stories]
  );

  return (
    <div>
      <h1>My Hacker Stories with {sumComments} comments.</h1>
      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      <hr />
      {stories.isError && <p>Something went wrong...</p>}
      {stories.isLoading ? (
        <p>Loading...</p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      )}
    </div>
  );
}

type SearchFormProps = {
  searchTerm: string;
  onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({
  searchTerm,
  onSearchInput,
  onSearchSubmit,
}) => (
  <form onSubmit={onSearchSubmit}>
    <InputWithLabel id="search" value={searchTerm} isFocused onInputChange={onSearchInput}>
      <strong>Search:</strong>
    </InputWithLabel>
    <button type="submit" disabled={!searchTerm}>
      Submit
    </button>
  </form>
);

type InputWithLabelProps = {
  id: string;
  value: string;
  type?: string;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isFocused?: boolean;
  children: React.ReactNode;
}

const InputWithLabel: React.FC<InputWithLabelProps> = ({ id, value, type = 'text', onInputChange, isFocused, children }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isFocused && inputRef.current) {
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

type ListProps = {
  list: Stories;
  onRemoveItem: (item: Story) => void;
}

const List: React.FC<ListProps> = ({ list, onRemoveItem }) => (
    <ul>
      {list.map(item => <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />)}
    </ul>
);

type ItemProps = {
  item: Story;
  onRemoveItem: (item: Story) => void;
}

const Item: React.FC<ItemProps> = ({ item, onRemoveItem }) => (
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
