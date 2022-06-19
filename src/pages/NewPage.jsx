import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { confirmAlert } from "react-confirm-alert";
import EditCanvas from "../components/artCanvas/EditCanvas";
import { endpoint } from "../helpers/endpoint";

function NewPage({ storyId }) {
  const canvasRef = useRef();
  const [storyTitle, setStoryTitle] = useState("");
  const [pageText, setPageText] = useState("");

  // Get title of the story
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
    }

    asyncGetPage();
  }, [storyId]);

  // Unclaim next and redirect to the previous page
  const redirectBack = useCallback(() => {
    async function asyncUnclaimNext() {
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
            pageCount,
          } = JSON.parse((await response.json()).body);

          fetch(`${endpoint}/unclaim-next-page`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              storyId,
              pageNum: pageCount,
            }),
          });

          window.location.href = `/p/${storyId}/s/${pageCount}`;
        });
    }

    asyncUnclaimNext();
  }, [storyId]);

  const onClickCancel = useCallback(() => {
    confirmAlert({
      title: 'Confirm to Cancel',
      message: 'If you leave your work will not be saved.',
      buttons: [
        {
          label: 'Leave',
          // @ts-ignore
          onClick: redirectBack,
        },
        {
          label: 'Stay',
          // @ts-ignore
          onClick: () => null,
        }
      ],
    })
  }, [redirectBack]);

  const saveWork = useCallback(() => {
    async function asyncSaveWork() {
      // @ts-ignore
      const imageUrl = canvasRef?.current?.toDataURL('image/png');

      // create new story
      await fetch(`${endpoint}/upload-page`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storyId,
            pageText,
          }),
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
  }, [storyId, pageText])

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
      <div className="story-title-view">
        {storyTitle}
      </div>
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

export default NewPage;