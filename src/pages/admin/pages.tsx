import React, { Component, useRef, useState, useEffect } from 'react';

// https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/react.html
const Editor = () => {
  const editorRef: any = useRef();
  const [editorLoaded, setEditorLoaded] = useState(false);
  const { CKEditor, ClassicEditor } = editorRef.current || {};

  useEffect(() => {
    editorRef.current = {
      CKEditor: require('@ckeditor/ckeditor5-react').CKEditor, //Added .CKEditor
      ClassicEditor: require('@ckeditor/ckeditor5-build-classic'),
    };
    setEditorLoaded(true);
  }, []);

  const [data, setData] = useState('');

  return (
    <>
      {editorLoaded ? (
        <CKEditor
          editor={ClassicEditor}
          data={data}
          onReady={editor => {
            // You can store the "editor" and use when it is needed.
            console.log('Editor is ready to use!', editor);
          }}
          onChange={(event, editor) => {
            const data = editor.getData();
            setData(data);
          }}
          onBlur={(event, editor) => {
            console.log('Blur.', editor);
          }}
          onFocus={(event, editor) => {
            console.log('Focus.', editor);
          }}
        />
      ) : (
        <p>Carregando...</p>
      )}
    </>
  );
};

export default Editor;
