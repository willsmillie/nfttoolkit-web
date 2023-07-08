import React, { useEffect, useState } from 'react';
import { Stack } from '@mui/material';
import { db } from '../../utils/firebase';
import FileUploadForm from './FileUploadForm';
import FileTable from '../../sections/files/table/sorting-selecting-table';

const FileList = ({ minter }) => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    // Fetch the files from Firestore for this nft
    const fetchFiles = async () => {
      if (!minter) return;
      await db
        .collection('files')
        .where('minter', '==', minter?.toLowerCase())
        .get()
        .then((querySnapshot) => {
          const filesData = [];

          querySnapshot.forEach((doc) => {
            filesData.push({ id: doc.id, ...doc.data() });
          });

          setFiles(filesData);
        })
        .catch((error) => {
          console.log('Error getting documents: ', error);
        });
    };

    fetchFiles();
  }, [minter]);

  // handle updating of the ui upon new files being added
  const onAddFile = (file) => {
    setFiles([...files, file]);
    console.log('ADDED FILE: ', file);
  };

  // remove a file from the database
  // and subsequently the files list, updating the UI
  const onDeleteFile = (file) => {
    db.collection('files')
      .doc(file.id)
      .delete()
      .then(() => {
        const newFiles = (files ?? []).filter((item) => item !== file);
        setFiles(newFiles);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleDeleteRows = (fileRefs) => {
    const batch = db.batch();

    // Delete each file in the batch
    fileRefs.forEach((fileRef) => {
      batch.delete(fileRef);
    });

    // Commit the batch deletion
    batch
      .commit()
      .then(() => {
        console.log('Files deleted successfully');
        const newFiles = files.filter((file) => !fileRefs.some((ref) => ref.id === file.id));
        setFiles(newFiles);
      })
      .catch((error) => {
        console.error('Error deleting files:', error);
      });
  };

  // update a pre-existing file
  const onUpdateFile = (file) => {
    console.log('Updating: ', file);
    db.collection('files')
      .doc(file.id)
      .update(file, { merge: true })
      .then((r) => {
        console.log('updated: ', r);
        const newFiles = replaceObjectById(files, file.id, file);
        setFiles(newFiles);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  function replaceObjectById(array, id, newObject) {
    return array.map((obj) => (obj.id === id ? newObject : obj));
  }

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flex: 'grow' }}>
        <h2>File List</h2>
        <FileUploadForm onAddFile={onAddFile} />
      </Stack>
      <FileTable files={files} deleteFile={onDeleteFile} updateFile={onUpdateFile} deleteSelection={handleDeleteRows} />
    </>
  );
};

export default FileList;
