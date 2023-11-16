import axios from "axios";
import {
  AtomicBlockUtils,
  Editor,
  EditorState,
  convertFromRaw
} from "draft-js";
import { Component } from "react";
import { useEffect, useState } from "react";

class View extends Component{
  constructor(props){
    super(props);
    this.state={
      editorState: EditorState.createEmpty(),
      height: 200,
      width: 200,
      align:"center",
      loading:false
    }
    this.onChange = (editorState) => this.setState({ editorState });
    
  }
  LoadMedia(asrc, atype, height, width,align, docName) {
    const { editorState } = this.state;
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      atype,
      "IMMUTABLE",
      {
        src: asrc,
        height,
        width,
        align,
        docName,
      }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    });
    this.setState(
      {
        editorState: AtomicBlockUtils.insertAtomicBlock(
          newEditorState,
          entityKey,
          " "
        ),
        loading: false,
        urlType: "",
      },
      // () => {
      //   setTimeout(() => this.focus(), 0);
      // }
    );
  }

  componentDidMount() {
    console.log("mounted");

    axios
      .get("https://incubator-draft.samadhan.agency/api/loadimage")
      .then((res) => {
        let x = 0;
        let json = res.data;
        console.log(json)
        if (!json.entityMap || !json.entityMap.length) {
          const contentState = convertFromRaw(json);
          const editorState = EditorState.createWithContent(contentState);
          this.setState({ editorState });
        } else {
          const loadMediaPromises = json.entityMap.map((entity) => {
            return this.LoadMedia(
              entity.data.src,
              entity.type,
              entity.data.height,
              entity.data.width,
              entity.data.align,
              entity.data.docName
            );
          });

          Promise.all(loadMediaPromises)
            .then(() => {})
            .catch((error) => {
              console.error("Error loading media:", error);
              const editorState = EditorState.createEmpty();
              this.setState({ editorState });
            });
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        const editorState = EditorState.createEmpty();
        this.setState({ editorState });
      });
  }
  render(){
    return(
      <div>
          <div className="editor">
          <Editor
            blockRendererFn={mediaBlockRenderer}
            editorState={this.state.editorState}
            onChange={this.onChange}
            placeholder="Enter some text..."
            readOnly='true'
          />
        </div>
      </div>
  )
  }

}
function mediaBlockRenderer(block) {
  if (block.getType() === "atomic") {
    return { component: Media, editable: false };
  }
  return null;
}

const Doc = (props) => {
  return (
    <a href={props.src} className="media">
      {props.docName}
    </a>
  );
};

const Image = (props) => {
  const { src, height, width, alignment } = props;
  //console.log(alignment);
  return (
    <img
      src={src}
      className={"media-"+alignment}
      alt="Example"
      height={height || 200}
      width={width || 200}
    />
  );
};

const Video = (props) => {
  const { src, height, width } = props;

  return (
    <video width={width || 240} height={height || 320} controls>
      <source src={src} className="media" />
    </video>
  );
};

const Media = (props) => {
  const entity = props.contentState.getEntity(props.block.getEntityAt(0));
  const { src, height, width, align,docName } = entity.getData();
  const type = entity.getType();

  let media;
  if (type === "doc") {
    media = <Doc src={src} docName={docName} />;
  } else if (type === "image") {
    media = <Image src={src} height={height} width={width} alignment={align} />;
  } else if (type === "video") {
    media = <Video src={src} height={height} width={width} />;
  }
  return media;
};

export default View;