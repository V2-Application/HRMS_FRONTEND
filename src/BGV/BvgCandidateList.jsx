import { Button, Flex, message, Segmented, Select, Table, Tag } from "antd";
import Pageheading from "../components/shared/Pageheading";
import { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import { ArrowRight, CircleCheck, CircleX, ClipboardCheck, ClipboardClock, Clock, Eye } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { set } from "../redux/uiSlice";

const BvgCandidateList = () => {
    const [bvgCandidateData, setBvgCandidateData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [auditorList, setAuditorList] = useState([]);
    const [activeTab, setActiveTab] = useState("pending");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { role } = useSelector((state) => state?.auth?.data);

    const candidateListData = [];
    const currentPage = 1;
    const pageSize = 10;

    const tabItems = [
        {
            value: 'pending',
            label: (
                <div style={{ paddingBlock: ".25rem" }}>
                    <Flex gap={4} align='center'>
                        <Flex style={{ width: "1.5rem", height: "1.5rem", borderRadius: "50%", backgroundColor: "#fef9c2" }} align='center' justify='center'>
                            <Clock size={16} color='#894b00' />
                        </Flex>
                        <span>Pending</span>
                    </Flex>
                </div>
            ),
            tooltip: "Pending"
        },
        {
            value: "approved",
            label: (
                <div style={{ paddingBlock: ".25rem" }}>
                    <Flex gap={4} align='center'>
                        <Flex style={{ width: "1.5rem", height: "1.5rem", borderRadius: "50%", backgroundColor: "#cbfbf1" }} align='center' justify='center'>
                            <CircleCheck size={16} color='#005f5a' />
                        </Flex>
                        <span>Approved</span>
                    </Flex>
                </div>
            ),
            tooltip: "Approved"
        },
        {
            value: "rejected",
            label: (
                <div style={{ paddingBlock: ".25rem" }}>
                    <Flex gap={4} align='center'>
                        <Flex style={{ width: "1.5rem", height: "1.5rem", borderRadius: "50%", backgroundColor: "#fbcbd3ff" }} align='center' justify='center'>
                            <CircleX size={16} color='#5f000eff' />
                        </Flex>
                        <span>Rejected</span>
                    </Flex>
                </div>
            ),
            tooltip: "Rejected"
        },
    ]

    function handleTableChange() {

    }

    function navigateBgvDetail(bgvId) {
        if (!bgvId) {
            message.error("BGVID not found.\nCannot show detail without id.")
        }
        navigate(`/bgv/verify/${bgvId}`);
    }

    async function fetchAuditorList() {
        try {
            const res = await axiosInstance.get("/api/BackgroundVerification/GetEmployeesWithAuditRole");
            if (!res?.data || !res?.data?.data || !Array.isArray(res?.data?.data)) {
                return;
            }
            const _auditorListData = res.data.data.map(item => {
                return { value: item?.id, label: item?.name };
            });
            console.log("auditor list", _auditorListData)
            setAuditorList(_auditorListData);
        } catch (error) {
            message.error("Failed to fetch auditor list.");
            console.log(error);
        }
    }

    async function handleAuditListChange(auditorId, candidateId, uid) {
        try {
            await dispatch(set({ loading: true }));
            const bodyData = {
                auditorId: auditorId,
                candidateId: candidateId
            };
            const res = await axiosInstance.post("/api/BackgroundVerification/AssignAuditor", bodyData);
            console.log(res);
            if (res && res?.data?.status) {
                const _bgvId = res?.data?.data?.bgvId;
                setBvgCandidateData((current) => {
                    return current.map(item => {
                        if (item.uid === uid) {
                            return { ...item, bgvId: _bgvId, auditorId: auditorId }
                        }
                        return item;
                    })
                })
                message.success("Auditor assigned for background verification process.");
            }
        } catch (error) {
            message.error("Oops! Something went wrong please try again.");
            console.log(error);
        }
        finally {
            await dispatch(set({ loading: false }));
        }
    }

    const totalWidth = 0;
    const theme = "";
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email id',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Date Of Birth',
            dataIndex: 'dob',
            key: 'dob',
            render: (data) => {
                return data?.substring(0, 10) || "";
            }
        },
        // {
        //     title: 'Designation',
        //     dataIndex: 'designation',
        //     key: 'designation',
        // },
        // {
        //     title: 'Department',
        //     dataIndex: 'department',
        //     key: 'department',
        // },
        {
            title: 'Mobile',
            dataIndex: 'mobile',
            key: 'mobile',
        },
        {
            title: "Status",
            key: 'status',
            render: (item) => {
                if (activeTab === 'pending') {
                    return (
                        <Tag color={"gold"} variant="outlined">Pending</Tag>
                    )
                } else if (activeTab === 'approved') {
                    return (
                        <Tag color={"cyan"} variant="outlined">Approved</Tag>
                    )
                } else if (activeTab === 'rejected') {
                    return (
                        <Tag color={"red"} variant="outlined">Rejected</Tag>
                    )
                } else {
                    return (
                        <Tag color={"gold"} variant="outlined">Pending</Tag>
                    )
                }
            }
        },
        {
            title: 'Action',
            fixed: 'right',
            key: 'uid',
            render: (item) => {
                if (role === 'Audit') {
                    return <Button icon={activeTab === 'pending' ? <ArrowRight size={16} /> : <Eye size={16} />} onClick={() => navigateBgvDetail(item?.bgvId)}></Button>
                }
                return (
                    <Select
                        value={item.auditorId}
                        disabled={item.bgvId !== null}
                        showSearch
                        optionFilterProp="label"
                        placeholder="Assign Auditor"
                        style={{ width: "100%" }}
                        options={auditorList}
                        filterOption={(input, option) => {
                            return option.label.toLowerCase().includes(input.toLowerCase());
                        }}
                        onChange={(e) => handleAuditListChange(e, item?.candidateId, item?.uid)}
                    />
                )
            }
        },
    ];

    async function fetchBvgCandidateList() {
        try {
            setBvgCandidateData([]);
            dispatch(set({ loading: true }));
            let url = '/api/BackgroundVerification/GetBgvCandidateList';
            const status = activeTab === 'pending' ? 4 : activeTab === 'approved' ? 1 : activeTab === 'rejected' ? 2 : 4;
            url += `?status=${status}`;
            const res = await axiosInstance.get(url);
            console.log(res);
            setLoading(false);
            if (!res?.data || !res?.data?.data || !Array.isArray(res?.data?.data) || !res?.data?.data?.length) {
                message.error("No data found.");
                setBvgCandidateData([]);
                return;
            }
            const _data = res?.data?.data.map(item => {
                return {
                    ...item,
                    uid: window.crypto.randomUUID()
                }
            })
            setBvgCandidateData(_data);
        } catch (error) {
            setBvgCandidateData([]);
            message.error(error?.message || "Failed to fetch candidates.")
        }
        finally {
            dispatch(set({ loading: false }));
        }
    }

    useEffect(() => {
        fetchBvgCandidateList();
        if (role !== 'Audit') {
            fetchAuditorList();
        }
    }, []);

    useEffect(() => {
        fetchBvgCandidateList();
    }, [activeTab])

    return (
        <>
            <Pageheading title="BGV Candidate List" marginBottom="1rem" />
            <Flex style={{ marginBottom: "1rem" }}>
                <Segmented options={tabItems} onChange={(val) => setActiveTab(val)} />
            </Flex>
            <Table
                loading={loading}
                rowKey="uid"
                tableLayout="fixed"
                columns={columns}
                pagination={{
                    current: currentPage,
                    total: bvgCandidateData.length,
                    position: ['bottomRight'],
                    pageSize: pageSize,
                    pageSizeOptions: ['10', '20', '50', '100', '500', '1000'],
                    onChange: handleTableChange,
                    showSizeChanger: true,
                    showQuickJumper: false,
                    showTotal: (total) => `Total ${total} items`,
                }}
                dataSource={bvgCandidateData}
                bordered={true}
                scroll={{ x: totalWidth + 50, y: 'calc(100vh - 160px)' }}
                style={{ whiteSpace: 'nowrap' }}
            />
        </>
    )
}

export default BvgCandidateList;