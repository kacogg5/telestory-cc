import { useCallback } from "react";

function HomePage() {
  const onClickStartStory = useCallback(() => {
    window.location.href = '/s/new';
  }, []);

  return (
    <div
      className="common-grid"
      style={{ width: 600 }}
    >
      <div className="story-title-view" style={{ width: 650 }}>
        Telestory
      </div>
      <div style={{display: "grid", gridTemplateColumns: "1fr auto", gap: 6}}>
        <div className="home-page-text-box backdrop">
          <div>
            Welcome to Telestory!
          </div>
          <div>
            Telestory is a fun and easy way to create and share stories. Just start a story, make a page, then send it to your friends. Then, sit back and see how your story twists.
          </div>
          <div>
            Try it now!
          </div>
          <div />
          <div
            className="bottom-button"
            style={{
              backgroundColor: "#83bf86",
              borderBottomColor: "#73af76",
            }}
            onClick={onClickStartStory}
          >Start a Story</div>
        </div>
        <img
          className="page-image-view"
          src="https://d3qdh8xs6uy3k8.cloudfront.net/jKm3hBl5Id-1.png"
          alt="Your drawing here"/>
      </div>
    </div>
  );
}

export default HomePage;