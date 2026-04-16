import { Button, Flex, message, Modal, Table, Tag } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import { useState } from 'react';
import axiosInstance from '../../services/axiosInstance';
import { useSelector } from 'react-redux';

const statusMaster = [""];

function statusTagRender(_status) {
    if (!_status) {
        return <Tag>{"N/A"}</Tag>
    }
    if (typeof _status === "string" && _status.trim().length) {
        if (_status === "Qualified") {
            return <Tag color={"green"} >{_status}</Tag>
        } else if (_status === "Rejected") {
            return <Tag color={"red"} >{_status}</Tag>
        } else if(_status === "Pending") {
            return <Tag color={"yellow"} >{_status}</Tag>
        } else {
            return <Tag>{_status}</Tag>
        }
    } else {
        return <Tag>{"N/A"}</Tag>
    }
}

const columns = [
    {
        title: 'Name',
        dataIndex: 'candidateName',
        key: 'candidateName',
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
    },
    {
        title: 'Designation',
        dataIndex: 'designation',
        key: 'designation',
    },
    {
        title: 'Mobile No.',
        dataIndex: 'mobile',
        key: 'mobile',
    },
    {
        title: 'Round',
        dataIndex: 'roundId',
        key: 'roundId',
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: statusTagRender
    },
    {
        title: 'Interviewer Status',
        dataIndex: 'interviewerStatus',
        key: 'interviewerStatus',
        render: statusTagRender
    }
]

async function fetchShortListedList(employeeId) {
    try {
        const response = await axiosInstance.get("/api/Applicant/GetApplicantFeedback");
        const data = response?.data;
        if (data && Array.isArray(data) && data.length) {
            const datafilteredByEmployee = data.filter(item => {
                return item?.interviewer?.includes(`${employeeId}`);
            }).map((item, index) => {
                item.key = index + 1;
                return item;
            })
            return datafilteredByEmployee;
        } else {
            message.error("No data found.");
            return [];
        }
    } catch (error) {
        message.error("Error fetching data. Please Try again.")
        console.error(error);
    }
}

const ApplicantInterviewActionHistoryModal = () => {
    const { employeeId } = useSelector((state) => state.auth.data);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tblDataSource, setTblDataSource] = useState([]);
    const [tblColumns, setTblColumns] = useState([]);
    const [loading, setLoading] = useState(true);

    const showModal = () => {
        setIsModalOpen(true);
    };

    async function handleModalStateChange(open) {
        if (open) {
            const dataSource = await fetchShortListedList(employeeId);
            setTblColumns(columns);
            setTblDataSource(dataSource);
            setLoading(false);
        } else {
            setTblDataSource([]);
            setTblColumns([]);
            setLoading(true);
        }
    }

    function handleCancel() {
        setIsModalOpen(false);
    }

    return (
        <>
            <Button color='primary' variant='filled' onClick={showModal}>
                <HistoryOutlined />Action History
            </Button>
            <Modal
                title={
                    <div>
                        <p style={{ margin: "0", fontWeight: "700", fontSize: "1.5rem" }}>History</p>
                        <p style={{ fontWeight: "400", color: "0.8", marginBottom: "0", fontSize: ".875rem" }}>Action history of applicant interviews.</p>
                    </div>
                }
                closable={{ 'aria-label': 'Modal Close Button' }}
                onCancel={handleCancel}
                open={isModalOpen}
                footer={[]}
                width={"100%"}
                afterOpenChange={handleModalStateChange}
                bodyStyle={{
                    overflowY: "auto"
                }}
                loading={loading}
            >
                <div style={{ width: "100%" }}>
                    <Table bordered={true} dataSource={tblDataSource} columns={tblColumns} scroll={{ x: "max-content", y: "80vh" }} />
                </div>
            </Modal>
        </>
    );
};
export default ApplicantInterviewActionHistoryModal;