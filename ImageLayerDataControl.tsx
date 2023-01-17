/**
 *
 * FILE : ImageLayerDataControl
 *
 * DESCRIPTION : 이미지 레이어 데이터 조작 컴포넌트
 *
 * AUTHOR : 이은지 (ellen)
 *
 * DATE : 2023-01-13
 *
 */
import { useRecoilState } from 'recoil';
import { css } from '@emotion/react';
import { Input, Radio, Button, RadioChangeEvent, Upload } from 'antd';
import { RcFile } from 'antd/es/upload';
import { Icons, palette } from '@maydaydevteam/yeeeyes-design';

import { ImageShapeType } from '@src/atoms/shapes';
import { selectShapeState } from '@src/atoms/selectShape';
import useImageUpload from '@src/hooks/useImageUpload';
import { DataControlType } from '.';

export default function ImageLayerDataControl({ updateShapeData, beforeUpload }: DataControlType) {
    const [selectedShape] = useRecoilState(selectShapeState);
    const [fileRef, eventPass, onImageChange, onDelete] = useImageUpload((val) => updateShapeData('file', val), 30);

    const onChange = (e: React.ChangeEvent<HTMLInputElement> | RadioChangeEvent) => {
        const { name, value } = e.target;
        if (!name) return;

        updateShapeData(name, value);
    };

    if (!selectedShape || !beforeUpload) return <></>;

    const { title, purpose, file, link } = selectedShape as ImageShapeType;

    return (
        <>
            <section>
                <label>1. 이미지 레이어 제목을 입력해 주세요.</label>
                <Input
                    name="title"
                    placeholder="제목을 입력해주세요."
                    value={title}
                    onChange={onChange}
                    css={css`
                        width: 360px;
                    `}
                />
            </section>

            <section>
                <label>2. 이미지를 업로드 해주세요.</label>
                <p className="gray6 fs-13 fw-500 mb-8">가로 16 : 세로 9 비율의 이미지만 업로드 해주세요.</p>
                <Upload
                    beforeUpload={(file: RcFile) => beforeUpload(file, (value) => updateShapeData('value', value))}
                    accept="image/jpg, image/png"
                    showUploadList={false}
                >
                    <Button
                        icon={<Icons icon="upload" />}
                        css={css`
                            width: 232px;
                        `}
                    >
                        이미지 업로드하기
                    </Button>
                </Upload>
            </section>

            <section>
                <label>3. 이미지 레이어 용도를 선택해 주세요.</label>

                <Radio.Group name="purpose" onChange={onChange} value={purpose}>
                    <Radio value="file">파일 다운로드</Radio>
                    <Radio value="link">링크 연결</Radio>
                    <Radio value="design">디자인용</Radio>
                </Radio.Group>
            </section>

            <section>
                {/* 파일 다운로드 */}
                {purpose === 'file' && (
                    <>
                        <label>4. 다운로드할 pdf파일을 업로드 해주세요.</label>
                        <p className="gray6 fs-13 fw-500 mb-8">30MB까지만 업로드가 가능해요.</p>

                        {file.name && (
                            <div css={fileInputCss}>
                                <div className="ds-flex gap-4 ai-c">
                                    <Icons icon="file" />
                                    <p className="fs-15 fw-500 gray8">{file.name}</p>
                                </div>

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete();
                                    }}
                                >
                                    <Icons icon="cancel" />
                                </button>
                            </div>
                        )}

                        {!file.name && (
                            <>
                                <Button icon={<Icons icon="file" />} size="small" onClick={eventPass}>
                                    파일 올리기
                                </Button>
                                <input
                                    type="file"
                                    ref={fileRef}
                                    onChange={onImageChange}
                                    accept="application/pdf"
                                    className="ds-none"
                                />
                            </>
                        )}
                    </>
                )}

                {/* 링크 연결 */}
                {purpose === 'link' && (
                    <>
                        <label>4. 연결할 웹 링크를 입력해 주세요.</label>
                        <Input
                            name="link"
                            value={link}
                            onChange={onChange}
                            placeholder="웹 링크를 입력해주세요."
                            css={css`
                                width: 360px;
                            `}
                        />
                    </>
                )}
            </section>
        </>
    );
}

export const fileInputCss = css`
    display: flex;
    align-items: center;
    border: 1px solid ${palette.gray.gray3};
    padding: 6px 12px;
    width: fit-content;

    p {
        min-width: 160px;
        line-height: 20px;
    }

    button {
        height: 20px;
        padding: 0;
    }
`;
