import React, { useCallback, useEffect, useState } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import './App.css';
import { endpoint } from './helpers/endpoint';
import HomePage from './pages/HomePage';
import NewPage from './pages/NewPage';
import NewStory from './pages/NewStory';
import ViewPage from './pages/ViewPage';

function App() {
  const [page, setPage] = useState(null);
  const [newRedirect, setNewRedirect] = useState(
    sessionStorage.getItem('newRedirect') === "true");

  const checkCanClaim = useCallback((storyId) => {
    async function asyncClaimNext() {
      let pageNum = 0;
      const response = await fetch(`${endpoint}/get-page-count`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storyId,
          }),
        }).then(async (response) => {
          const {
            pageCount
          } = JSON.parse((await response.json()).body);

          pageNum = pageCount;

          return await fetch(`${endpoint}/get-claim-status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              storyId,
              pageNum,
            }),
          });
        });

      const {
        canClaim
      } = JSON.parse((await response.json()).body);

      if (canClaim) {
        await fetch(`${endpoint}/claim-next-page`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storyId,
            pageNum,
          }),
        });

        setNewRedirect(true);
      } else {
        confirmAlert({
          title: 'Oops!',
          message: 'You can\'t continue the story at this time! Most likely, someone else is currently continuing this page.',
          buttons: [
            {
              label: 'OK',
              // @ts-ignore
              onClick: () => {
                window.location.href = `/s/${storyId}/p/${pageNum}`;
              }
            },
          ],
        });
      }
    }

    asyncClaimNext();
  }, []);

  const redirectLastPage = useCallback((storyId) => {
    async function asyncRedirectLastPage() {
      await fetch(`${endpoint}/get-page-count`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyId,
        }),
      }).then(async (response) => {
        const {
          pageCount
        } = JSON.parse((await response.json()).body);

        if (pageCount > 0) {
          window.location.href = `/s/${storyId}/p/${pageCount}`;
        } else {
          confirmAlert({
            title: 'Oops!',
            message: 'This story has no pages!',
            buttons: [
              {
                label: 'OK',
                // @ts-ignore
                onClick: () => {
                  window.location.href = `/`;
                }
              },
            ],
          });
        }
      });
    }

    asyncRedirectLastPage();
  }, []);

  useEffect(() => {
    const pathVariables = window.location.pathname.split(/[\\/]/g);
    const [, _s, storyId, _p, pageNum] = pathVariables;

    if (_s !== 's' || storyId === undefined) {
      // home page
      setPage(<HomePage />)
    } else if (storyId === 'new') {
      // new story
      setPage(<NewStory />);
    } else if (_p !== 'p' || pageNum === undefined) {
      // view story
      redirectLastPage(storyId);
    } else if (pageNum === 'new') {
      // new page
      if (!newRedirect) { checkCanClaim(storyId); }
      setPage(<NewPage storyId={storyId} />);
    } else {
      // view story
      setPage(<ViewPage storyId={storyId} pageNum={pageNum} />);
    }
  }, [checkCanClaim, redirectLastPage, newRedirect]);

  return (
    <div className='center'>
      {page}
      <div className='backdrop' style={{maxWidth: 200}}>
        <b>
          Icons found at <a target="_blank" rel="noreferrer" href="https://icons8.com">Icons8</a>
        </b>
        <ul>
          {[
            ["https://icons8.com/icon/20309/pencil-drawing", "Pencil Drawing"],
            ["https://icons8.com/icon/8181/eraser", "Eraser"],
            ["https://icons8.com/icon/86206/copy", "Copy"],
          ].map(([path, text]) => (
            <li key={path}>
              <a target="_blank" rel="noreferrer" href={path}>{text}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
