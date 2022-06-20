import { useCallback, useEffect, useState } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import { endpoint } from '../helpers/endpoint';

function ViewPage({ storyId, pageNum }) {
  const [storyTitle, setStoryTitle] = useState('');
  const [pageText, setPageText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [nextFinished, setNextFinished] = useState(false);

  const newPage = sessionStorage.getItem('newPage') === `${storyId}-${pageNum}`;

  useEffect(() => {
    async function asyncGetPage() {
      fetch(`${endpoint}/get-story-info`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storyId,
          }),
        }).then(async (response) => {
          const {
            storyTitle,
          } = JSON.parse((await response.json()).body);

          setStoryTitle(storyTitle.S);
        });

      fetch(`${endpoint}/get-page-info`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storyId,
            pageNum,
          }),
        }).then(async (response) => {
          const {
            pageText,
            imageUrl,
            nextFinished,
          } = JSON.parse((await response.json()).body);

          setPageText(pageText.S);
          setImageUrl(imageUrl.S);
          setNextFinished(nextFinished.BOOL === "true");
        });
    }

    asyncGetPage();
  }, [pageNum, storyId]);

  const onClickCopy = useCallback(() => {
    navigator.clipboard.writeText(window.location.toString());
  }, []);

  const onClickContinue = useCallback(() => {
    async function asyncClaimNext() {
      const response = await fetch(`${endpoint}/get-claim-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyId,
          pageNum,
        }),
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

        sessionStorage.setItem("newRedirect", "true");
        window.location.href = `/s/${storyId}/p/new`;
      } else {
        confirmAlert({
          title: 'Oops!',
          message: 'You can\'t continue the story at this time! Most likely, someone else is currently continuing this page.',
          buttons: [
            {
              label: 'OK',
              // @ts-ignore
              onClick: () => null
            },
          ],
        });
      }
    }

    asyncClaimNext();
  }, [storyId, pageNum]);

  const onClickPrevious = useCallback(() => {
    window.location.href = `/s/${storyId}/p/${pageNum - 1}`;
  }, [storyId, pageNum]);

  const onClickNext = useCallback(() => {
    window.location.href = `/s/${storyId}/p/${pageNum + 1}`;
  }, [storyId, pageNum]);

  return (
    <div
      className="common-grid"
    >
      <div className="story-title-view">
        {storyTitle}
      </div>
      <div className="page-text-view">
        {pageText}
      </div>
      <img
        className="page-image-view"
        src={imageUrl}
        alt="Your drawing here"/>
      { newPage ? (
        <div className="backdrop share-section">
          <div style={{margin: "0 6px 6px 6px"}}>Great! Now send this link to a friend to continue the story!</div>
          <div className="share-link">
            <p>{window.location.toString()}</p>
            <img className="copy-button" src={"/copy.png"} alt="Copy" onClick={onClickCopy}/>
          </div>
        </div>
      ) : (
        <div className="backdrop submit-row">
          {pageNum > 1 && (
            <div 
              className="bottom-button"
              style={{
                backgroundColor: "#8386bf",
                borderBottomColor: "#7376af",
              }}
              onClick={onClickPrevious}
            >&lt;</div>
          )}
          { !nextFinished ? (
            <>
              <div className='whn-prompt'>
                What happens next?
              </div>
              <div
                className="bottom-button"
                style={{
                  backgroundColor: "#83bf86",
                  borderBottomColor: "#73af76",
                }}
                onClick={onClickContinue}
              >And Then...</div>
            </>
          ) : (
            <>
              <div>p. {pageNum}</div>
              <div 
                className="bottom-button"
                style={{
                  backgroundColor: "#8386bf",
                  borderBottomColor: "#7376af",
                }}
                onClick={onClickNext}
              >&gt;</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ViewPage;