import { useCallback, useMemo, useRef, useState } from "react";
import EditCanvas from "../components/artCanvas/EditCanvas";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { endpoint } from "../helpers/endpoint";

function NewStory() {
  const canvasRef = useRef();
  const [storyTitle, setStoryTitle] = useState("");
  const [pageText, setPageText] = useState("");

  const redirectHome = useCallback(() => {
    setTimeout(() => {
      window.location.href = `/`;
    }, 1000);
  }, []);

  const onClickCancel = useCallback(() => {
    confirmAlert({
      title: 'Confirm to Cancel',
      message: 'If you leave your work will not be saved.',
      buttons: [
        {
          label: 'Leave',
          // @ts-ignore
          onClick: redirectHome,
        },
        {
          label: 'Stay',
          // @ts-ignore
          onClick: () => null,
        }
      ]
    })
  }, [redirectHome]);

  const saveWork = useCallback(() => {
    async function asyncSaveWork() {
      // @ts-ignore
      const imageUrl = canvasRef?.current?.toDataURL('image/png');

      // create new story
      await fetch(`${endpoint}/create-story`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storyTitle,
          }),
        }).then(async (response) => {
          const {
            storyId,
          } = JSON.parse((await response.json()).body);

          console.log(storyId);
          return await fetch(`${endpoint}/upload-page`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              storyId,
              pageText,
            }),
          });
        }).then(async (response) => {
          const {
            storyId,
            pageNum,
          } = JSON.parse((await response.json()).body);

          await fetch(`${endpoint}/upload-page-image`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              storyId,
              pageNum,
              imageUrl,
            }),
          });

          sessionStorage.setItem('newPage', `${storyId}-${pageNum}`);
          // console.log(`/s/${storyId}/p/${pageNum}`)
          window.location.href = `/s/${storyId}/p/${pageNum}`;
        });
    }

    asyncSaveWork();
  }, [storyTitle, pageText])

  const onClickSubmit = useCallback(() => {
    if (storyTitle.length > 0 && pageText.length > 0) {
      confirmAlert({
        title: 'Confirm to Save',
        message: 'You will not be able to edit this page once you submit. Proceed carefully',
        buttons: [
          {
            label: 'I\'m Done',
            // @ts-ignore
            onClick: saveWork,
          },
          {
            label: 'Not Done',
            // @ts-ignore
            onClick: () => null,
          }
        ]
      });
    }
  }, [saveWork, storyTitle, pageText]);

  return (
    <div
      className="common-grid"
    >
      <textarea
        className="story-title"
        rows={1}
        placeholder="What's it called?"
        onChange={(e) => setStoryTitle(e.target.value)}
      />
      <textarea
        className="page-text"
        rows={3}
        placeholder={"How's it start?"}
        onChange={(e) => setPageText(e.target.value)}
      />
      <EditCanvas canvasRef={canvasRef}/>
      <div className="submit-row">
        <div 
          className="bottom-button"
          style={{
            backgroundColor: "#ef8683",
            borderBottomColor: "#df7673",
          }}
          onClick={onClickCancel}
        >Cancel</div>
        <div 
          className="bottom-button"
          style={useMemo(() => storyTitle.length > 0 && pageText.length > 0 ? {
            backgroundColor: "#83bf86",
            borderBottomColor: "#73af76",
          } : {
            backgroundColor: "#bbbbbb",
            borderBottomColor: "#ababab",
            color: "grey",
          }, [storyTitle, pageText])}
          onClick={onClickSubmit}
        >Done</div>
      </div>
    </div>
  )
}

export default NewStory;