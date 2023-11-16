import React, { Component } from "react";
import {
    AtomicBlockUtils,
    Editor,
    EditorState,
    RichUtils,
    ContentBlock,
    genKey,
    convertToRaw,
} from "draft-js";
import { convertToHTML } from "draft-convert";

import createToolbarPlugin from "draft-js-static-toolbar-plugin";

import MediaSidebar from "./mediaSideBar";
import axios from "axios";
import { convertFromRaw } from "draft-js";

export default class MediaEditorExample extends Component {
    constructor(props) {
        super(props);
        this.toolbarPlugin = createToolbarPlugin();

        this.state = {
            editorState: EditorState.createEmpty(),
            isImagePopupOpen: false,
            isDocPopupOpen: false,
            isVideoPopupOpen: false,
            isMediaSidebarOpen: false,
            isBlockOptionsOpen: false,
            showURLInput: false,
            url: "",
            urlType: "",
            drop: false,
            loading: false,
            disable: false,
            height: 200,
            width: 200,
            docName: "",
            videoUrl: "",
            isAddingVideoViaLink: false,
        };

        this.focus = () => this.refs.editor.focus();

        this.onChange = (editorState) => this.setState({ editorState });
        this.onURLChange = (e) => {
            this.setState({ urlValue: e.target.files[0] });
        };
        this.addDoc = this._addDoc.bind(this);
        this.addImage = this._addImage.bind(this);
        this.addVideo = this._addVideo.bind(this);
        this.confirmMedia = this._confirmMedia.bind(this);
        this.handleKeyCommand = this._handleKeyCommand.bind(this);
        this.dropFile = this.dropFile.bind(this);
        this.onURLInputKeyDown = this._onURLInputKeyDown.bind(this);
        this.logContentState = this.logContentState.bind(this);
        this.convertToHTMLContent = this.convertToHTMLContent.bind(this);
        this.handleInlineStyle = this.handleInlineStyle.bind(this);
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.state.drop !== prevState.drop) {
            this.setState({ loading: true });
            const { editorState, urlValue, urlType } = this.state;
            const data = new FormData();
            data.append("file", urlValue);
            axios
                .post(
                    "https://incubator-draft.samadhan.agency/api/save-image",
                    data
                )
                .then((res) => {
                    this.LoadMedia(res.data, "image");
                });
        }
    }
    componentDidMount() {
        console.log("mounted");

        axios
            .get("https://incubator-draft.samadhan.agency/api/loadimage")
            .then((res) => {
                let x = 0;
                let json = res.data;

                if (!json.entityMap || !json.entityMap.length) {
                    const contentState = convertFromRaw(json);
                    const editorState =
                        EditorState.createWithContent(contentState);
                    this.setState({ editorState });
                } else {
                    const loadMediaPromises = json.entityMap.map((entity) => {
                        return this.LoadMedia(
                            entity.data.src,
                            entity.type,
                            entity.data.height,
                            entity.data.width,
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

    _handleKeyCommand(command) {
        const { editorState } = this.state;
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            this.onChange(newState);
            return true;
        }
        return false;
    }
    dropFile(e) {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        this.setState({ drop: true, urlValue: file });
    }

    _confirmMedia(e) {
        e.preventDefault();
        const {
            editorState,
            urlValue,
            urlType,
            height,
            width,
            docName,
            videoUrl,
        } = this.state;

        // var isAddingVideoViaLink = this.state.isAddingVideoViaLink;

        // if (videoUrl.length > 1) {
        //     this.setState({ isAddingVideoViaLink: true });
        // } else {
        //     this.setState({ isAddingVideoViaLink: false });
        // }

        if (urlType === "video" && videoUrl.length > 1) {
            const videoEmbedCode = videoUrl;

            const contentState = editorState.getCurrentContent();
            const contentStateWithEntity = contentState.createEntity(
                urlType,
                "IMMUTABLE",
                {
                    src: videoEmbedCode,
                    height: height || null,
                    width: width || null,
                    docName: null,
                    isAddingVideoViaLink: true,
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
                    showURLInput: false,
                },
                () => {
                    setTimeout(() => this.focus(), 0);
                }
            );
        } else {
            this.setState({ loading: true });
            const data = new FormData();
            data.append("file", urlValue);
            axios
                .post(
                    "https://incubator-draft.samadhan.agency/api/save-image",
                    data
                )
                .then((res) => {
                    console.log(res.data);
                    this.setState({ loading: false });
                    const contentState = editorState.getCurrentContent();
                    const contentStateWithEntity = contentState.createEntity(
                        urlType,
                        "IMMUTABLE",
                        {
                            src: res.data,
                            height: urlType !== "doc" ? height : null,
                            width: urlType !== "doc" ? width : null,
                            docName: urlType === "doc" ? docName : null,
                            isAddingVideoViaLink: false,
                        }
                    );
                    const entityKey =
                        contentStateWithEntity.getLastCreatedEntityKey();
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
                            showURLInput: false,
                        },
                        () => {
                            setTimeout(() => this.focus(), 0);
                        }
                    );
                });
        }
    }

    LoadMedia(asrc, atype, height, width, docName) {
        const { editorState } = this.state;
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
            atype,
            "IMMUTABLE",
            {
                src: asrc,
                height,
                width,
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
            () => {
                setTimeout(() => this.focus(), 0);
            }
        );
    }

    _onURLInputKeyDown(e) {
        if (e.which === 13) {
            this._confirmMedia(e);
        }
    }

    _promptForMedia(type) {
        this.setState({
            showURLInput: true,
            urlValue: "",
            urlType: type,
            docName: type === "doc" ? "document" : this.state.docName,
            isAddingVideoViaLink: type === "video" && !this.state.urlValue,
        });
    }

    _addDoc() {
        this._promptForMedia("doc");
    }

    _addImage() {
        this._promptForMedia("image");
    }

    _addVideo() {
        this._promptForMedia("video");
    }

    updateHeight = (e) => {
        const height = parseInt(e.target.value, 10);
        this.setState({ height });
    };

    updateWidth = (e) => {
        const width = parseInt(e.target.value, 10);
        this.setState({ width });
    };

    handleInlineStyle = (style) => {
        const { editorState } = this.state;
        let newEditorState = editorState;

        if (style === "left" || style === "center" || style === "right") {
            newEditorState = RichUtils.toggleInlineStyle(editorState, style);
        }

        this.setState({ editorState: newEditorState });
    };

    handleBlockStyle = (style) => {
        this.setEditorState(RichUtils.toggleBlockType(this.editorState, style));
    };

    toggleMediaSidebar = () => {
        this.setState((prevState) => ({
            isMediaSidebarOpen: !prevState.isMediaSidebarOpen,
        }));
    };

    toggleBlockOptions = () => {
        this.setState((prevState) => ({
            isBlockOptionsOpen: !prevState.isBlockOptionsOpen,
        }));
    };
    changeInlineStyles = (style) => {
        this.setState((prevState) => ({
            editorState: RichUtils.toggleInlineStyle(
                prevState.editorState,
                style
            ),
        }));
    };
    handleAddBlock = (blockType) => {
        const { editorState } = this.state;
        const contentState = editorState.getCurrentContent();
        const newBlock = new ContentBlock({
            key: genKey(),
            type: blockType,
            text: "This is a new block with dummy text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia massa nec justo tincidunt, eget accumsan quam malesuada.",
        });

        const newBlockMap = contentState
            .getBlockMap()
            .set(newBlock.getKey(), newBlock);
        const newContentState = contentState.merge({
            blockMap: newBlockMap,
            selectionAfter: contentState
                .getSelectionAfter()
                .set("anchorKey", newBlock.getKey()),
        });
        const newEditorState = EditorState.push(
            editorState,
            newContentState,
            "insert-fragment"
        );
        this.setState({
            editorState: EditorState.forceSelection(
                newEditorState,
                newContentState.getSelectionAfter()
            ),
            isBlockOptionsOpen: false,
        });
    };

    onClose = () => {
        this.setState({ showURLInput: false });
    };

    logContentState() {
        const { editorState } = this.state;
        const contentState = editorState.getCurrentContent();
        const contentStateJSON = convertToRaw(contentState);
        this.sendToDb(contentStateJSON, "json");
    }
    sendToDb(data, type) {
        axios
            .post("https://incubator-draft.samadhan.agency/api/send-data", {
                data,
                type,
            })
            .then((res) => {});
    }
    convertToHTMLContent() {
        const { editorState } = this.state;
        const contentState = editorState.getCurrentContent();
        const html = convertToHTML(contentState);
    }

    render() {
        let urlInput;
        const { Toolbar } = this.toolbarPlugin;
        const plugins = [this.toolbarPlugin];

        if (this.state.showURLInput) {
            urlInput = (
                <div className="image-popup">
                    <div className="image-popup-content">
                        <div className="image-popup-header">
                            <span className="image-popup-title">
                                Insert {this.state.urlType}
                            </span>
                            <button
                                className="image-popup-close"
                                onClick={this.onClose}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="image-popup-body">
                            <input
                                onChange={this.onURLChange}
                                ref="url"
                                className="urlInput"
                                type="file"
                                onKeyDown={this.onURLInputKeyDown}
                            />
                            {this.state.urlType !== "doc" && (
                                <div>
                                    Height:{" "}
                                    <input
                                        type="number"
                                        onChange={this.updateHeight}
                                        value={this.state.height}
                                    />
                                    Width:{" "}
                                    <input
                                        type="number"
                                        onChange={this.updateWidth}
                                        value={this.state.width}
                                    />
                                </div>
                            )}
                            {this.state.urlType === "video" && (
                                <div>
                                    Video URL:{" "}
                                    <input
                                        type="text"
                                        value={this.state.videoUrl}
                                        onChange={(e) =>
                                            this.setState({
                                                videoUrl: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            )}
                            {this.state.urlType === "doc" && (
                                <div>
                                    Document Name:{" "}
                                    <input
                                        type="text"
                                        value={this.state.docName}
                                        onChange={(e) =>
                                            this.setState({
                                                docName: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            )}
                        </div>
                        <div className="image-popup-footer">
                            {this.state.loading ? (
                                <div
                                    className="spinner-border mx-4"
                                    role="status"
                                >
                                    {/* <span className="visually-hidden">Loading...</span> */}
                                </div>
                            ) : (
                                ""
                            )}
                            <button
                                className="image-popup-insert"
                                disabled={this.state.loading}
                                onClick={this.confirmMedia}
                            >
                                Insert
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="editorMain">
                <div className="editorSection">
                    {urlInput}
                    <div
                        className="editor"
                        onClick={this.focus}
                        onDrop={this.dropFile}
                    >
                        <Editor
                            blockRendererFn={mediaBlockRenderer}
                            editorState={this.state.editorState}
                            handleKeyCommand={this.handleKeyCommand}
                            onChange={this.onChange}
                            placeholder="Enter some text..."
                            ref="editor"
                            plugins={plugins}
                        />
                    </div>
                    <div
                        className="add-media-icon"
                        onClick={this.toggleMediaSidebar}
                    >
                        +
                    </div>
                    <MediaSidebar
                        isOpen={this.state.isMediaSidebarOpen}
                        onClose={this.toggleMediaSidebar}
                        onAddBlock={this.handleAddBlock}
                        onImageSelect={this.addImage}
                        onDocSelect={this.addDoc}
                        onVideoSelect={this.addVideo}
                        viewRaw={this.logContentState}
                        viewHtml={this.convertToHTMLContent}
                        changeInlineStyles={this.changeInlineStyles}
                    />
                </div>
            </div>
        );
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
    const { src, height, width } = props;

    return (
        <img
            src={src}
            className="media"
            alt="Example"
            height={height || 200}
            width={width || 200}
        />
    );
};

const Video = (props) => {
    const { src, height, width, isAddingVideoViaLink } = props;

    const isLink = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(src);

    if (isAddingVideoViaLink) {
        if (isLink) {
            return (
                <div>
                    <iframe
                        src={src}
                        width={width || 240}
                        height={height || 320}
                    ></iframe>
                </div>
            );
        } else {
            return <div dangerouslySetInnerHTML={{ __html: src }} />;
        }
    } else {
        return (
            <video width={width || 240} height={height || 320} controls>
                <source src={src} className="media" />
            </video>
        );
    }
};

const Media = (props) => {
    const entity = props.contentState.getEntity(props.block.getEntityAt(0));
    const { src, height, width, docName, isAddingVideoViaLink } =
        entity.getData();
    const type = entity.getType();

    let media;
    if (type === "doc") {
        media = <Doc src={src} docName={docName} />;
    } else if (type === "image") {
        media = <Image src={src} height={height} width={width} />;
    } else if (type === "video") {
        media = (
            <Video
                src={src}
                height={height}
                width={width}
                isAddingVideoViaLink={isAddingVideoViaLink}
            />
        );
    }
    return media;
};
