import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function MediaSidebar({
  isOpen,
  onClose,
  onImageSelect,
  onDocSelect,
  onVideoSelect,
  onAddBlock,
  viewRaw,
  viewHtml,
  changeInlineStyles,
}) {
  const [isBlockDropdownOpen, setIsBlockDropdownOpen] = useState(false);

  return (
    <div className={`media-sidebar ${isOpen ? "open" : ""}`}>
      <div className="media-sidebar-content">
        <div className="row no-gutters mb-2 ">
          <div className="col-md-6 no-padding">
            <div className="shadow">
              <div
                className="bg-white p-3 add-media-option "
                onClick={onImageSelect}
              >
                <i className="fa fa-image"></i>
                <div className="work">Add Image</div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div
              className="bg-white p-3 shadow add-media-option"
              onClick={onVideoSelect}
            >
              <i className="fa fa-film"></i>
              <div className="work">Add Video</div>
            </div>
          </div>
        </div>
        <div className="row no-gutters mb-2 ">
          <div className="col-md-6 no-padding">
            <div className="shadow">
              <div
                className="bg-white p-3 add-media-option "
                onClick={onDocSelect}
              >
                <i className="fa fa-file"></i>
                <div className="work">Add Doc</div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="shadow">
              <div
                className="bg-white p-3 add-media-option"
                onClick={() => onAddBlock("header-one")}
              >
                <i className="fa fa-heading">H1</i>
                <div className="work">Header 1</div>
              </div>
            </div>
          </div>
        </div>

        <div className="row no-gutters mb-2 ">
          <div className="col-md-6 no-padding">
            <div className="shadow">
              <div
                className="bg-white p-3 add-media-option"
                onClick={() => onAddBlock("header-two")}
              >
                <i className="fa fa-heading">H2</i>
                <div className="work">Header 2</div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="shadow">
              <div
                className="bg-white p-3 add-media-option"
                onClick={() => onAddBlock("header-three")}
              >
                <i className="fa fa-heading">H3</i>
                <div className="work">Header 3</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row no-gutters mb-2 ">
          <div className="col-md-6 no-padding">
            <div className="shadow">
              <div
                className="bg-white p-3 add-media-option"
                onClick={() => onAddBlock("blockquote")}
              >
                <i className="fa fa-quote-right"></i>
                <div className="work">Blockquote</div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="shadow">
              <div
                className="bg-white p-3 add-media-option"
                onClick={() => onAddBlock("code-block")}
              >
                <i className="fa fa-code"></i>
                <div className="work">Codeblock</div>
              </div>
            </div>
          </div>
        </div>

        <div className="row no-gutters mb-2 ">
          <div className="col-md-6 no-padding">
            <div className="shadow">
              <div
                className="bg-white p-3 add-media-option"
                onClick={() => onAddBlock("unordered-list-item")}
              >
                <i className="fa fa-list-ul"></i>
                <div className="work">Unordered List</div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="shadow">
              <div
                className="bg-white p-3 add-media-option"
                onClick={() => onAddBlock("ordered-list-item")}
              >
                <i className="fa fa-list-ol"></i>
                <div className="work">Ordered List</div>
              </div>
            </div>
          </div>
        </div>

        {/* <div>
<button onClick={(e)=>{e.preventDefault()}} onMouseDown={() => changeInlineStyles("BOLD")}>
<b>B</b>
</button>
<button onMouseDown={() => changeInlineStyles("ITALIC")} onClick={(e)=>{e.preventDefault()}}>
  <i>I</i>
</button>
<button onMouseDown={() => changeInlineStyles("UNDERLINE")} onClick={(e)=>{e.preventDefault()}}>
  <u>U</u>
</button>
</div> */}
      </div>

      <div className="row no-gutters mb-2 fixed-buttons">
        <div className="col-md-6">
          <button className="btn btn-primary" onClick={viewRaw}>
            Update
          </button>
        </div>
        <div className="col-md-6">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default MediaSidebar;
