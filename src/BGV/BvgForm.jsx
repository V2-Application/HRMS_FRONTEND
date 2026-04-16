import { Button, Card, Col, DatePicker, Divider, Flex, Form, Input, message, Row, Table, Typography } from "antd";
import { ArrowLeft, CircleCheck, CircleX, File, FileText } from "lucide-react";
import axiosInstance from "../services/axiosInstance";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Meta from "antd/es/card/Meta";
import { useDispatch } from "react-redux";
const { Title, Text } = Typography;
import { set } from "../redux/uiSlice";

const baseUrl = import.meta.env.VITE_API_URL

const candidateDocsTablecolumns = [
    {
        title: 'Document Name',
        dataIndex: 'FileType',
        key: 'name',
    },
    {
        title: 'Link',
        dataIndex: 'FilePath',
        key: 'link',
        render: ((a) => (
            <Link to={`${baseUrl}/${a}`} target="_blank"><Button color="primary" variant="link">Link</Button></Link>
        ))
    }
];

const previousEmploymentDetailColumns = [
    {
        title: 'Name of company',
        dataIndex: 'companyName',
        key: 'companyName',
    },
    {
        title: 'Work Location',
        dataIndex: 'companyName',
        key: 'companyName',
    },
    {
        title: 'Position Held',
        dataIndex: 'companyName',
        key: 'companyName',
    },
    {
        title: 'From',
        dataIndex: 'from',
        key: 'from',
    },
    {
        title: 'To',
        dataIndex: 'to',
        key: 'to',
    },
    {
        title: "CTC",
        dataIndex: "ctc",
        key: "ctc"
    }
]

const BvgForm = () => {
    const navigate = useNavigate();
    const params = useParams();
    const [candidateDetail, setCandidateDetail] = useState(null);
    const [candidateDocs, setCandidateDocs] = useState([]);
    const [candidateEmploymentDetails, setCandidateEmploymentDetails] = useState([]);
    const { id: bgvId } = params;
    const [form] = Form.useForm();
    const dispatch = useDispatch();

    function handleBack() {
        navigate("/bgv");
    }

    async function handleAuditorAction(action) {
        try {
            await form.validateFields(["audit_date", "auditor_remarks"]);
            dispatch(set({ loading: true }))
            const validActions = ['approve', 'reject'];
            if (!validActions.includes(action)) {
                console.log("Invalid action.");
                return;
            }
            if (isNaN(bgvId)) {
                console.log("incorrect background verification id");
                return;
            };
            let status = null;
            if (action === 'approve') {
                status = 1
            } else if (action === 'reject') {
                status = 2
            } else {
                status = 4
            }
            const bodyData = {
                status,
                remarks: form.getFieldValue("auditor_remarks"),
                bgvId: Number(bgvId),
                auditDate: form.getFieldValue("audit_date") || new Date(Date.now()),
            };
            const res = await axiosInstance.post("/api/BackgroundVerification/AuditorFeedback", bodyData);
            console.log(res);
            if (res && res?.data) {
                if (res?.data?.status) {
                    message.success(res?.data?.message || "Success");
                } else {
                    message.error(res?.data?.message || "Failed to update.");
                }
            }
            navigate("/bgv");
        } catch (error) {
            message.error(error?.message || "Failed to update background verification.");
            console.log(error);
        }
        finally {
            dispatch(set({ loading: false }))
        }
    }

    async function fetchCandidateDetail() {
        try {
            dispatch(set({ loading: true }))
            console.log("candidate detail")
            const res = await axiosInstance.get(`/api/BackgroundVerification/FetchBgvCandidateDetails/${bgvId}`);
            console.log(res);
            if (res?.data && res?.data?.data) {
                console.log("data");
                setCandidateDetail(res?.data?.data);
            }
        } catch (error) {
            message.error("There was some problem fetching candidate details. Please try again later.")
        } finally {
            dispatch(set({ loading: false }))
        }
    }

    useEffect(() => {
        fetchCandidateDetail();
    }, []);
    useEffect(() => {
        (async () => {
            if (candidateDetail !== null) {
                try {
                    console.log(candidateDetail);
                    form.setFieldValue("employee_name", candidateDetail?.candidateName);
                    form.setFieldValue("designation", candidateDetail?.designation);
                    form.setFieldValue("doj", candidateDetail?.joiningDate?.substring(0, 10) || "");
                    form.setFieldValue("ctc", candidateDetail?.ctc);

                    let docs = [];
                    if (candidateDetail?.candidateDocs) {
                        docs = await JSON.parse(candidateDetail?.candidateDocs);
                    }
                    let employmentDetails = [];
                    if (candidateDetail?.candidateExperience) {
                        employmentDetails = await JSON.parse(candidateDetail?.candidateExperience);
                    }
                    setCandidateDocs(docs);
                    setCandidateEmploymentDetails(employmentDetails);
                } catch (error) {
                    console.error(error);
                }
            }
        })()
    }, [candidateDetail])
    return (
        <>
            <Flex gap={".5rem"} align="center" style={{ marginBottom: "1rem" }}>
                <Button style={{ paddingLeft: ".25rem" }} color="default" variant='solid' shape='round' onClick={handleBack} icon={<Flex align='center' justify='center' style={{ backgroundColor: "white", width: "1.5rem", height: "1.5rem", borderRadius: "50%" }}><ArrowLeft color='black' size={14} /></Flex>}>Back</Button>
                <Title level={3} style={{ margin: "0" }}>BGV Detail</Title>
            </Flex>
            <Form form={form} name="layout-multiple-horizontal" layout="vertical">
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Form.Item
                            label="Employee Name"
                            name="employee_name"
                            rules={[{ required: true }]}
                            labelCol={{ span: 4 }}
                        >
                            <Input readOnly />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Name Of Organization" name="name_of_organization" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="Date Of Joining" name="doj">
                            {/* <Input type="date" /> */}
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="Designation" name="designation" rules={[{ required: true }]}>
                            <Input readOnly />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="CTC (Cost To Company)" name="ctc" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="Employee Tenure" name="employee_tenure" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Issue During Employment (If any)" name="issue_during_employment">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Exit Formalities Pending (If any)" name="exit_formalities">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label="Reason Of Leaving" name="reason_of_leaving">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col>
                        <Form.Item label="Referee Contact Details" name="refreee_contact_details">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col>
                        <Form.Item label="Referee Details" name="refree_details">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label="Eligibility of Rehire (If no, kindly specify the reason):" name="eligibility_of_rehire">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Title level={4}>Candidate Docs</Title>
                {/* <Table style={{marginBottom: "1rem"}} columns={candidateDocsTablecolumns} dataSource={candidateDocs} /> */}
                <Row gutter={[16, 16]} style={{ marginBottom: "1rem" }}>
                    {
                        candidateDocs.map((item) => {
                            return (<Col span={4}>
                                <Card style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px;", padding: "0" }}>
                                    <Meta title={item?.FileType} avatar={<FileText size={16} />} />
                                    <Link style={{ marginLeft: "1rem" }} to={`${baseUrl}/${item?.FilePath}`} target="_blank"><Button color="primary" variant="link">View</Button></Link>
                                </Card>
                            </Col>
                            )
                        })
                    }
                </Row>

                <Title level={4}>Audit Verification</Title>
                <Row gutter={[16, 16]}>
                    {/* <Col span={6}>
                        <Form.Item label="Auditor Name" name="auditor_name">
                            <Input />
                        </Form.Item>
                    </Col> */}
                    {/* <Col span={8}>
                        <Form.Item label="Last Employer 1" name="auditor_last_employer_1">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Last Employer 2" name="auditor_last_employer_1">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Last Employer 3" name="auditor_last_employer_1">
                            <Input />
                        </Form.Item>
                    </Col> */}
                    {/* <Col span={6}>
                        <Form.Item label="Signature" name="auditor_signature">
                        <Input />
                        </Form.Item>
                        </Col> */}
                    <Col span={24}>
                        <Title level={5}>Previous Employment Details</Title>
                        <Table columns={previousEmploymentDetailColumns} dataSource={[]} />
                    </Col>
                    <Col span={6}>
                        <Form.Item label="Audit Date" name="audit_date" rules={[{ required: true, message: "Please select audit date" }]}>
                            <DatePicker style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label="Remarks" name="auditor_remarks" rules={[{ required: true, message: "Please enter remarks" }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Flex gap={8} align="center" wrap>
                    <Button onClick={() => handleAuditorAction('reject')} color="danger" variant="solid" icon={<CircleX style={{ display: "flex", alignItems: "center", justifyContent: "center" }} size={16} />}>Reject</Button>
                    <Button onClick={() => handleAuditorAction('approve')} color="blue" variant="solid" icon={<CircleCheck style={{ display: "flex", alignItems: "center", justifyContent: "center" }} size={16} />}>Approve</Button>
                </Flex>
            </Form>
        </>
    )
}

export default BvgForm;