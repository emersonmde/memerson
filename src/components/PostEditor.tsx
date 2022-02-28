import React, {useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {Editor} from "react-draft-wysiwyg";
import {EditorState} from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "./PostEditor.css";
import {Box, Button, TextField} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  default: {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
  },
  editor: {
    select: {
      background: 'transparent'
    },
    borderColor: theme.palette.text.primary,
    border: '1px solid',
    // backgroundColor: '#fff',
    backgroundColor: theme.palette.background.default,
    // color: '#000',
    color: theme.palette.text.primary,
    paddingLeft: '5px',
    paddingRight: '5px',
    lineHeight: '50%',
  },
  title: {
    width: '100%',
    margin: '10px 0 10px 0',
  },
  submit: {
    marginTop: "10px"
  }
}));

function PostEditor() {
  const [editorState, setEditorState] = useState<EditorState>(() => EditorState.createEmpty());

  const onEditorStatechange = (editorState: EditorState) => {
    setEditorState(editorState);
  }

  const classes = useStyles();
  const toolbar = {
    inline: {
      className: classes.default,
      dropdownClassName: classes.default,
      "&:hover, &:focus, &:active": {
        backgroundColor: "#000000",
      }
    },
    blockType: {
      className: classes.default,
      dropdownClassName: classes.default
    },
    fontSize: {
      className: classes.default,
      dropdownClassName: classes.default
    },
    fontFamily: {
      className: classes.default,
      dropdownClassName: classes.default
    },
    list: {
      className: classes.default,
      dropdownClassName: classes.default
    },
    textAlign: {
      className: classes.default,
      dropdownClassName: classes.default
    },
    colorPicker: {
      className: classes.default,
      popupClassName: classes.default
    },
    link: {
      className: classes.default,
      dropdownClassName: classes.default,
      popupClassName: classes.default
    },
    emoji: {
      className: classes.default,
      popupClassName: classes.default
    },
    embeded: {
      className: classes.default,
      popupClassName: classes.default
    },
    image: {
      className: classes.default,
      popupClassName: classes.default
    },
    remove: {
      className: classes.default
    },
    history: {
      className: classes.default,
      dropdownClassName: classes.default
    },
  }

  return (
    <Box textAlign='center'>
      <TextField id="title" label="Title" variant="outlined" className={classes.title}/>
      <Editor
        editorState={editorState}
        onEditorStateChange={onEditorStatechange}
        editorClassName={classes.editor}
        toolbarClassName={classes.default}
        toolbar={toolbar}
      />
      <Button variant="outlined" onClick={() => true} className={classes.submit}>Submit Post</Button>
    </Box>
  )
}

export default PostEditor;