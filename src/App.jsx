import * as React from 'react';

const list = [
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

function App() {
  return (
      <div>
        <h1>
          My Hacker Stories
        </h1>
        <ul>
          {list.map(item => {
            return (
            <li key={item.objectID}>
              <span>
                <a href={item.url}>{item.title}</a>
              </span>
              <span>by {item.author}</span>
              <span>Number of Comments: {item.num_comments}</span>
              <span>Points: {item.points}</span>
            </li>
            );
          })}
        </ul>
        <label htmlFor="search">Search: <input id="search" type="text" /></label>
      </div>
  );
}

export default App;
