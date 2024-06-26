'use client'
import { PrimaryEditor } from '@/editor';
import { CheckView, ContainerWrapper, FlexItemWrapper, FlexWrapper, FooterActionView, HeaderActionView, LabelView, Messages, NonFormWrapper, Spinner, TextInputView } from '@/helpers';
import { useCheckboxUpdate, useFetchResource, useResourceSingle, useResourceUpdate } from '@/hooks';
import { useParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'

export default function EditPaper() {
    const { id } = useParams();

    const { data } = useResourceSingle('papers', id);
    
    const [formData, setFormData] = useState({
        papername: '',
        preselectedlevels: '',
        initialContent: ''
    });
    
    const [paperDescription, setPaperDescription] = useState('');

    useEffect(() => {
      if (data?.data) {
        const levelOptionIds = data.data.Levels?.map(level => level.level_id);
        setFormData({
          ...formData,
          papername: data.data.papername || '',
          preselectedlevels: levelOptionIds || [],
          initialContent: data.data.paperdescription || ''
        });
        editorInstanceHandler();
      }
    }, [data]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });
    };

    const editorInstanceHandler = (content, editor) => {
      setPaperDescription(content);
    }

    const { data: dataFetchedLevels } = useFetchResource('levels/all');
    const [levels, setLevels] = useState([]);
    useEffect(() => {
      if (dataFetchedLevels.success) {
        setLevels(dataFetchedLevels.data.levels);
      }
    }, [dataFetchedLevels]);
    
    const [levelItems, levelBoxes, handleSelectAllLevels, clearAllLevels] = useCheckboxUpdate(levels, 'md:w-1/4', formData.preselectedlevels);

    const { data: dataUpdated, updateResource } = useResourceUpdate(`papers`, id, formData, setFormData);

    const handleUpdate = async (e) => {
      e.preventDefault();
      const updateItem = {
        papername: formData.papername,
        paperdescription: paperDescription,
        level_ids: levelItems,
      };
      updateResource(updateItem, '/admin/h/papers');
    };
  

  return (
    <ContainerWrapper>
      <HeaderActionView
          backLink="/admin/h/papers"
          backText="Papers"
          itemText="Edit Paper"
      />
      {dataUpdated.loading && <Spinner/>}
      {dataUpdated.error && !dataUpdated.loading && <Messages>{dataUpdated.error}</Messages>}
      <NonFormWrapper>
        <FlexWrapper>
          <FlexItemWrapper width={`md:w-1/2`}>
              <LabelView name={`Paper Name`} forWhat={`papername`} />
              <TextInputView
                  id={`papername`}
                  type={`text`}
                  name={`papername`}
                  value={formData.papername}
                  change={handleChange}
                  autoComplete={false}
                  placeholder={`Name of the Paper`}
              />
          </FlexItemWrapper>
        </FlexWrapper>

        <FlexWrapper>
            <FlexItemWrapper width={`md:w-1/1`}>
                <LabelView name={`Paper Description`} forWhat={`paperdescription`} />
                <PrimaryEditor 
                  editorInstanceHandler={editorInstanceHandler}
                  editorConfig={{
                    menubar: false,
                    selector: "paperdescription",
                    height: 300,
                  }}
                  initialValue={formData.initialContent}
                />
            </FlexItemWrapper>
        </FlexWrapper>

        <FlexWrapper>
          <FlexItemWrapper width={`md:w-1/1`}>
              {dataFetchedLevels.loading && <Spinner />}
              {dataFetchedLevels.error && <Messages>{dataFetchedLevels.error}</Messages>}
              {!dataFetchedLevels.loading && !dataFetchedLevels.error && (
                  <CheckView
                      title={`Levels`}
                      label={`levels`} 
                      data={levelBoxes}
                      handleSelectAll={handleSelectAllLevels}
                      allSelected = {levelItems}
                  />
              )}
          </FlexItemWrapper>
        </FlexWrapper>

        <FooterActionView 
            handleSubmit={handleUpdate} 
            data={dataUpdated}
            createText="Update Paper"
        />

      </NonFormWrapper>
    </ContainerWrapper>
  )
}