import React, { useState, useRef } from "react";
import {
    Button,
    Tabs,
    Input,
    Select,
    Row,
    Col,
    Space,
    Divider,
    Typography,
    Tooltip,
    Card,
    Checkbox,
    Table,
    InputNumber,
    DatePicker,
    Modal,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    SaveOutlined,
    CloseOutlined,
    PoweroffOutlined,
    LeftOutlined,
    RightOutlined,
    StepBackwardOutlined,
    StepForwardOutlined,
    ZoomInOutlined,
    FilterOutlined,
    CheckOutlined,
    FullscreenOutlined,
    FullscreenExitOutlined,
} from "@ant-design/icons";
import binoculars from '../../../assets/images/icons/binoculars.png'
import files from '../../../assets/images/icons/files.png'
import letter from '../../../assets/images/icons/letter-x.png'
import logout from '../../../assets/images/icons/logout.png'
import note from '../../../assets/images/icons/note.png'
import save from '../../../assets/images/icons/save.png'
import dayjs from "dayjs";
// import SalaryControlPanelModal from "../../modals/SalaryControlPanelModal";
import Draggable from "react-draggable";



const { TabPane } = Tabs;
const { Option } = Select;
const { Title, Text } = Typography;

const SalaryEditControlPanel = ({ salarySlipControlPanal, setsalarySlipControlPanal }) => {
    const [activeTab, setActiveTab] = useState("addRecord");
    const [checkedList, setCheckedList] = useState([]);
    const [viewSearch, setviewSearch] = useState(false)
    const [viewMode, setviewMode] = useState('ViewOnly')
    const [fullScreen, setfullScreen] = useState(false)
    const [disabled, setDisabled] = useState(true);
    const draggleRef = useRef(null);


    const onTabChange = (key) => {
        setActiveTab(key);
    };

    const currentDate = new Date();

    // Sample form fields state for demonstration
    const [form, setForm] = useState({
        name: "MS. KHUSHBOO JHA",
        nameCode: "V27948",
        fatherName: "SUBHASH CHANDRA JHA",
        designation: "EXECUTIVE",
        subDesignation: "",
        subDesignationCode: 0,
        company: "V2 RETAIL LTD",
        companyCode: 1,
        branch: "MAIN BRANCH",
        branchCode: 1,
        department: "HUMAN RESOURCE",
        departmentCode: 5,
        subDepartment: "",
        subDepartmentCode: 0,
        location: "HO",
        locationCode: 261,
        pfNo: "",
        pfApplicable: "Yes",
        ceiling: "Yes",
        pfCode: "DL/26342/",
        esiNo: "",
        esiApplicable: "No",
        esiCode: "",
        totalDays: "30",
        present: "22",
        absent: "2",
        holidays: "2",
        weeklyOff: "4",
        cl: "1",
        el: "1",
        sl: "0",
        moreLeaveMOL: "0",
        compensatoryOff: "1",
        payable: "26",
        basicSalaryEarned: 50000,
        basicSalaryRate: 5000,
        basicSalaryArrears: 2000,
        daEarned: 10000,
        daRate: 1000,
        daArrears: 500,
        hraEarned: 8000,
        hraRate: 800,
        hraArrears: 300,
        ccaEarned: 6000,
        ccaRate: 600,
        ccaArrears: 200,
        transportAllowanceEarned: 4000,
        transportAllowanceRate: 400,
        transportAllowanceArrears: 150,
        elDaysEarned: 5,
        elDaysRate: 1000,
        elDaysArrears: 5000,
        elAmountEarned: 5000,
        elAmountRate: 500,
        elAmountArrears: 2000,
        netArrearsEarned: 3000,
        netArrearsRate: 300,
        netArrearsArrears: 100,
        pfEsiEarned: 2000,
        pfEsiRate: 200,
        pfEsiArrears: 100,
        otHoursEarned: 10,
        otHoursRate: 200,
        otHoursArrears: 1000,
        otAmountEarned: 2000,
        otAmountRate: 200,
        otAmountArrears: 500,
        medicalAllowanceEarned: 3000,
        medicalAllowanceRate: 300,
        medicalAllowanceArrears: 150,
        incentiveEarned: 2500,
        incentiveRate: 250,
        incentiveArrears: 100,
        foodingAllowanceEarned: 2000,
        foodingAllowanceRate: 200,
        foodingAllowanceArrears: 100,
        specialAllowanceEarned: 1500,
        specialAllowanceRate: 150,
        specialAllowanceArrears: 50,
        extraAllowanceEarned: 1000,
        extraAllowanceRate: 100,
        extraAllowanceArrears: 50,
        leaveEncashmentEarned: 500,
        leaveEncashmentRate: 50,
        leaveEncashmentArrears: 20,
        medicalRemEarned: 300,
        medicalRemRate: 30,
        medicalRemArrears: 10,
        ltaEarned: 2000,
        ltaRate: 200,
        ltaArrears: 100,
        bonusExGratiaEarned: 1000,
        bonusExGratiaRate: 100,
        bonusExGratiaArrears: 50,
        monthlyTdsDeduction: "500",
        monthlyTdsEmployerContbn: "250",
        monthlyTdsArrears: "0",

        tdsDeduDeduction: "300",
        tdsDeduEmployerContbn: "150",
        tdsDeduArrears: "0",

        epfSalaryDeduction: "1000",
        epfSalaryEmployerContbn: "1200",
        epfSalaryArrears: "0",

        epFundDeduction: "800",
        epFundEmployerContbn: "800",
        epFundArrears: "50",

        pensionSalaryDeduction: "700",
        pensionSalaryEmployerContbn: "700",
        pensionSalaryArrears: "0",

        fpFundDeduction: "200",
        fpFundEmployerContbn: "200",
        fpFundArrears: "0",

        esiSalaryDeduction: "150",
        esiSalaryEmployerContbn: "150",
        esiSalaryArrears: "10",

        esiDeduction: "120",
        esiEmployerContbn: "180",
        esiArrears: "5",

        // Right Column Fields
        pTaxDeduction: "350",
        pTaxRate: "3.5",
        pTaxArrears: "25",

        lwfDeduction: "20",
        lwfRate: "0.2",
        lwfArrears: "0",

        incPaidDeduction: "250",
        incPaidRate: "2.5",
        incPaidArrears: "0",

        tdsDeduction: "400",
        tdsRate: "1.0",
        tdsArrears: "30",

        esiRebateDeduction: "100",
        esiRebateRate: "0.5",
        esiRebateArrears: "0",

        recoveryDeduction: "75",
        recoveryRate: "0.75",
        recoveryArrears: "10",

        cashShortDeduction: "50",
        cashShortRate: "0.5",
        cashShortArrears: "0",

        dieselDeduction: "90",
        dieselRate: "0.9",
        dieselArrears: "5",

        penaltyDeduction: "80",
        penaltyRate: "0.8",
        penaltyArrears: "0",

        lwfRebateDeduction: "15",
        lwfRebateRate: "0.1",
        lwfRebateArrears: "0",
        monthly_Advance_Deduction: "1500",
        monthly_Advance_EmployerContbn: "750",
        monthly_Advance_Arrears: "200",
        advance_dedu_Deduction: "1200",
        advance_dedu_EmployerContbn: "600",
        advance_dedu_Arrears: "150",
        loan_installment_Deduction: "5000",
        loan_installment_EmployerContbn: "2000",
        loan_installment_Arrears: "1000",

        loan_inst_dedu_Deduction: "3000",

        medical_rate_month: 100,
        medical_deposited: 80,
        fuel_maintenance_rate_month: 150,
        fuel_maintenance_deposited: 120,
        books_periodicals_rate_month: 50,
        books_periodicals_deposited: 40,
        professional_attire_rate_month: 70,
        professional_attire_deposited: 60,
        driver_wages_rate_month: 200,
        driver_wages_deposited: 180,
        mobile_rate_month: 30,
        mobile_deposited: 25,
        meal_voucher_rate_month: 40,
        meal_voucher_deposited: 35,

        medical_billed: 90,
        medical_withdrawal: 70,
        fuel_maintenance_billed: 140,
        fuel_maintenance_withdrawal: 110,
        books_periodicals_billed: 45,
        books_periodicals_withdrawal: 35,
        professional_attire_billed: 65,
        professional_attire_withdrawal: 55,
        driver_wages_billed: 190,
        driver_wages_withdrawal: 170,
        mobile_billed: 28,
        mobile_withdrawal: 22,
        meal_voucher_billed: 38,
        meal_voucher_withdrawal: 33,

        grossSalary: "50000",           // Gross Salary
        deductions: "5000",             // Deductions
        netSalary: "45000",

        paymentMode: 'Cheque',
        instrumentNo: 'CHQ123456',
        instrumentDate: '2025-07-10',
        drawnOnBank: 'HDFC Bank Ltd.',
        drawnOnAccount: 'Saving Account - 1234567890',

        printVoucher: "Voucher #12345",
        printed1: "John Doe",
        printed2: "Approved by HR",
        printed3: "Issued on 2025-07-14",

        holdSalary: "Yes", // or "No" or ""
        holdSalary_reason: "Pending documentation",

        paid: "Yes",       // or "No" or ""
        paidOn: "2025-07-10",

        month: currentDate.getMonth() + 1, // 1 to 12
        year: currentDate.getFullYear(),

        calculationMode: "Automatic"
    });

    const handleInputChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    // Options for checkboxes
    const options = [
        'Lock Salary Record',
        'Lock Advance',
        'Lock Loan Installment',
        'Lock Arrears',
        'Lock T.D.S.',
    ];

    const dataSource = [
        {
            key: '1',
            totalDays: 0,
            present: 0,
            absent: 0,
            holidays: 0.0,
            weeklyOff: 0.0,
            CL: 0.0,
            EL: 0.0,
            SL: 0.0,
            compOff: 0.0,
            MOL: 0.0,
            payable: 0.0,
        },
    ];

    const dataSourcee = [
        {
            key: '1',
            totalDays: 0,
            present: 0,
            absent: 0,
            holidays: 0.0,
        },
    ];

    const columns = [
        {
            title: 'Total Days',
            dataIndex: 'totalDays',
            render: (text) => <Input type="number" defaultValue={text} />,
        },
        {
            title: 'Present',
            dataIndex: 'present',
            render: (text) => <Input type="number" defaultValue={text} />,
        },
        {
            title: 'Absent',
            dataIndex: 'absent',
            render: (text) => <Input type="number" defaultValue={text} />,
        },
        {
            title: 'Holidays',
            dataIndex: 'holidays',
            render: (text) => <Input type="number" defaultValue={text} />,
        },
        {
            title: 'Weekly Off',
            dataIndex: 'weeklyOff',
            render: (text) => <Input type="number" defaultValue={text} />,
        },
        {
            title: 'C.L.',
            dataIndex: 'CL',
            render: (text) => <Input type="number" defaultValue={text} />,
        },
        {
            title: 'E.L.',
            dataIndex: 'EL',
            render: (text) => <Input type="number" defaultValue={text} />,
        },
        {
            title: 'S.L.',
            dataIndex: 'SL',
            render: (text) => <Input type="number" defaultValue={text} />,
        },
        {
            title: 'Comp. Off',
            dataIndex: 'compOff',
            render: (text) => <Input type="number" defaultValue={text} />,
        },
        {
            title: 'MOL',
            dataIndex: 'MOL',
            render: (text) => <Input type="number" defaultValue={text} />,
        },
        {
            title: 'Payable',
            dataIndex: 'payable',
            render: (text) => <Input type="number" defaultValue={text} />,
        },
    ];
    const columnss = [
        {
            title: 'Total Days',
            dataIndex: 'totalDays',
            render: (text) => <Input type="number" defaultValue={text} />,
        },
        {
            title: 'Present',
            dataIndex: 'present',
            render: (text) => <Input type="number" defaultValue={text} />,
        },
        {
            title: 'Absent',
            dataIndex: 'absent',
            render: (text) => <Input type="number" defaultValue={text} />,
        },
        {
            title: 'Holidays',
            dataIndex: 'holidays',
            render: (text) => <Input type="number" defaultValue={text} />,
        },
    ];

    return (
        <div
            style={{
                height: '624px',
                overflow: 'hidden',
                border: "1px solid #d9d9d9",
                padding: 12,
                background: "#f5f5f5",
                boxShadow:
                    "0 1px 2px rgba(0, 0, 0, 0.05), inset 0 1px 0 #ffffff, inset 0 -1px 0 #d9d9d9",
                fontFamily:
                    '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            }}
        >
            {viewSearch ? <AttachmentSearch setviewSearch={setviewSearch} /> :
                <>
                    {/* Toolbar */}
                    <Space className="head_sal_btn" style={{ marginBottom: 2, display: 'flex', justifyContent: 'space-between', width: '100%', }}>
                        {/* <Button style={{ width: 100, fontSize: 16 }} icon={files}>Add</Button> */}
                        <div style={{ flex: 2, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 5, }}>
                            <Button
                                style={{ flex: 1, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}
                            >
                                <img src={files} alt="files icon" style={{ width: 16, height: 16 }} />
                                Add
                            </Button>

                            <Button
                                style={{ flex: 1, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}
                            >
                                <img src={note} alt="files icon" style={{ width: 16, height: 16 }} />
                                Edit
                            </Button>

                            <Button
                                style={{ flex: 1, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}
                            >
                                <img src={letter} alt="files icon" style={{ width: 16, height: 16 }} />
                                Delete
                            </Button>

                            <Button onClick={() => setviewSearch(true)}
                                style={{ flex: 1, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}
                            >
                                <img src={binoculars} alt="files icon" style={{ width: 16, height: 16 }} />
                                Search
                            </Button>
                        </div>



                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                            <Divider type="vertical" />
                            <Button style={{ fontSize: 16 }} icon={<StepBackwardOutlined />} />
                            <Button style={{ fontSize: 16 }} icon={<LeftOutlined />} />
                            <Button style={{ fontSize: 16 }} icon={<RightOutlined />} />
                            <Button style={{ fontSize: 16 }} icon={<StepForwardOutlined />} />
                            <Divider type="vertical" />
                        </div>

                        <div style={{ flex: 2, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 5 }}>

                            {fullScreen ? <Button onClick={() => { setfullScreen(true) }} icon={<FullscreenOutlined />} style={{ flex: 1, fontSize: 16, }}> </Button>
                                : <Button onClick={() => setfullScreen(false)} icon={<FullscreenExitOutlined />} style={{ flex: 1, fontSize: 16, }}> </Button>}

                            <Button disabled
                                style={{ flex: 1, fontSize: 16, }}
                            >
                                <img src={save} alt="files icon" style={{ width: 16, height: 16 }} />
                                Save
                            </Button>


                            <Button disabled 
                                style={{ flex: 1, fontSize: 16, }}
                            >
                                <img src={letter} alt="files icon" style={{ width: 16, height: 16 }} />
                                Cancel
                            </Button>

                            <Button onClick={()=>setsalarySlipControlPanal(false)}
                                style={{ flex: 1, fontSize: 16, }}
                            >
                                <img src={logout} alt="files icon" style={{ width: 16, height: 16 }} />
                                Exit
                            </Button>
                        </div>
                    </Space>



                    {/* Tabs */}
                    <Tabs className="custom-tabss" activeKey={activeTab} onChange={onTabChange} type="card" size="small" style={{ background: "#fff", marginTop: 16 }}>
                        <TabPane tab="Add Record" key="addRecord">
                            <Row gutter={[24, 16]} style={{ padding: 25, rowGap: 5, minHeight: 500 }}>
                                <Col span={12}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>Month / Year</label>
                                        <Input.Group compact style={{ flex: 1 }}>
                                            <Select
                                                value={form.month}
                                                onChange={(value) => handleInputChange("month", value)}
                                                style={{
                                                    width: "calc(100% - 200px)",
                                                    backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : "#fff",
                                                    pointerEvents: viewMode === "ViewOnly" ? "none" : "auto",
                                                }}
                                                disabled={viewMode === "ViewOnly"}
                                            >
                                                {[
                                                    "January", "February", "March", "April", "May", "June",
                                                    "July", "August", "September", "October", "November", "December",
                                                ].map((month, index) => (
                                                    <Option key={index + 1} value={index + 1}>{month}</Option>
                                                ))}
                                            </Select>

                                            <InputNumber
                                                value={form.year}
                                                onChange={(value) => handleInputChange("year", value)}
                                                style={{
                                                    width: 200,
                                                    backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : "#fff",
                                                    pointerEvents: viewMode === "ViewOnly" ? "none" : "auto",
                                                }}
                                                min={1900}
                                                max={2100}
                                                disabled={viewMode === "ViewOnly"}
                                            />
                                        </Input.Group>
                                    </div>
                                </Col>

                                <Col span={8} style={{ textAlign: "right", }}>
                                    {/* <Button icon={<ZoomInOutlined />}>Find</Button> */}
                                </Col>

                                {/* Father's Name */}
                                <Col span={16}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>Name</label>
                                        <Input.Group compact style={{ flex: 1 }}>
                                            <Input
                                                value={form.name}
                                                onChange={(e) => handleInputChange("name", e.target.value)}
                                                style={{ width: "calc(100% - 200px)", backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                disabled={false}
                                                readOnly={viewMode === "ViewOnly"}
                                            />
                                            <Input
                                                value={form.nameCode}
                                                onChange={(e) => handleInputChange("nameCode", e.target.value)}
                                                style={{ width: 200, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                disabled={false}
                                                readOnly={viewMode === "ViewOnly"}
                                            />
                                        </Input.Group>

                                    </div>
                                </Col>
                                {/* DOJ */}
                                <Col span={8}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>D.O.J. :</label>
                                        <Text>12-09-2024</Text>
                                    </div>
                                </Col>



                                {/* Designation */}
                                <Col span={16}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>If Transferred</label>
                                        <Select value={form.transferred} onChange={(val) => handleInputChange("transferred", val)}
                                            style={{
                                                width: 175,
                                                backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : "#fff",
                                                pointerEvents: viewMode === "ViewOnly" ? "none" : "auto",
                                            }}
                                            disabled={viewMode === "ViewOnly"}
                                        >
                                            <Select.Option value="No">No</Select.Option>
                                            <Select.Option value="Yes">Yes</Select.Option>
                                        </Select>
                                    </div>
                                </Col>



                                {/* <Col span={8} /> */}
                                <Col span={4}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>D.O.L. :</label>
                                        {/* <Text>- -</Text> */}
                                    </div>
                                </Col>

                                {/* Sub-Designation */}
                                <Col span={8}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>Reason</label>
                                        <Select
                                            value={form.pfNo}
                                            onChange={(value) => handleInputChange("pfNo", value)}
                                            style={{
                                                flex: 1,
                                                backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : "#fff",
                                                pointerEvents: viewMode === "ViewOnly" ? "none" : "auto",
                                            }}
                                            disabled={viewMode === "ViewOnly"}
                                        >
                                            <Option value="Personal">Personal</Option>
                                            <Option value="Medical">Medical</Option>
                                            <Option value="Official">Official</Option>
                                            <Option value="Family Emergency">Family Emergency</Option>
                                            <Option value="Others">Others</Option>
                                        </Select>
                                    </div>
                                </Col>


                                <Col span={6}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label
                                            style={{
                                                whiteSpace: "nowrap",
                                                textOverflow: "ellipsis",
                                                marginRight: 12,
                                            }}
                                        >
                                            Effective Date
                                        </label>
                                        <DatePicker
                                            value={
                                                dayjs(form.effectiveDate, "YYYY-MM-DD", true).isValid()
                                                    ? dayjs(form.effectiveDate)
                                                    : null
                                            }
                                            onChange={(date, dateString) =>
                                                handleInputChange("effectiveDate", dateString)
                                            }
                                            format="YYYY-MM-DD"
                                            style={{
                                                width: "100%",
                                                backgroundColor:
                                                    viewMode === "ViewOnly" ? "#f5f5f5" : "#fff",
                                                pointerEvents: viewMode === "ViewOnly" ? "none" : "auto",
                                            }}
                                            disabled={viewMode === "ViewOnly"}
                                            allowClear={false}
                                        />
                                    </div>
                                </Col>
                                <Col span={2}></Col>

                                <Col span={8}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>D.O.C. :</label>
                                        <Text>12-09-2024</Text>
                                    </div>
                                </Col>

                                <Col span={16}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>Company</label>
                                        <Input.Group compact style={{ flex: 1 }}>
                                            <Input
                                                value={form.subDesignation}
                                                onChange={(e) => handleInputChange("subDesignation", e.target.value)}
                                                style={{ width: "calc(100% - 150px)", backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                type="number"
                                                value={form.subDesignationCode}
                                                onChange={(e) => handleInputChange("subDesignationCode", e.target.value)}
                                                style={{ width: 150, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                </Col>



                                {/* <Col span={8} /> */}

                                {/* Company */}
                                <Col span={16}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>Location</label>
                                        <Input.Group compact style={{ flex: 1 }}>
                                            <Input
                                                value={form.company}
                                                onChange={(e) => handleInputChange("company", e.target.value)}
                                                style={{ width: "calc(100% - 150px)", backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                type="number"
                                                value={form.companyCode}
                                                onChange={(e) => handleInputChange("companyCode", e.target.value)}
                                                style={{ width: 150, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                </Col>


                                <Col span={16}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>Remarks</label>
                                        <Input.Group compact style={{ flex: 1 }}>
                                            <Input
                                                value={form.branch}
                                                onChange={(e) => handleInputChange("company", e.target.value)}
                                                style={{ width: "calc(100% - 150px)", backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                type="number"
                                                value={form.branchCode}
                                                onChange={(e) => handleInputChange("companyCode", e.target.value)}
                                                style={{ width: 150, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                </Col>

                                {/* <Col span={16}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>Department</label>
                                        <Input.Group compact style={{ flex: 1 }}>
                                            <Input
                                                value={form.department}
                                                onChange={(e) => handleInputChange("company", e.target.value)}
                                                style={{ width: "calc(100% - 50px)", backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                type="number"
                                                value={form.departmentCode}
                                                onChange={(e) => handleInputChange("companyCode", e.target.value)}
                                                style={{ width: 50, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                </Col>

                                <Col span={16}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>Sub-Department</label>
                                        <Input.Group compact style={{ flex: 1 }}>
                                            <Input
                                                value={form.subDepartment}
                                                onChange={(e) => handleInputChange("company", e.target.value)}
                                                style={{ width: "calc(100% - 50px)", backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                type="number"
                                                value={form.subDepartmentCode}
                                                onChange={(e) => handleInputChange("companyCode", e.target.value)}
                                                style={{ width: 50, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                </Col>

                                <Col span={16}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>Location</label>
                                        <Input.Group compact style={{ flex: 1 }}>
                                            <Input
                                                value={form.location}
                                                onChange={(e) => handleInputChange("company", e.target.value)}
                                                style={{ width: "calc(100% - 50px)", backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                type="number"
                                                value={form.locationCode}
                                                onChange={(e) => handleInputChange("companyCode", e.target.value)}
                                                style={{ width: 50, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                </Col> */}



                                <Col span={4} />

                                {/* PF No */}
                                {/* <Col span={8}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>P.F. No.</label>
                                        <Input
                                            value={form.pfNo}
                                            onChange={(e) => handleInputChange("pfNo", e.target.value)}
                                            style={{ flex: 1, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                </Col>

                                <Col span={4}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", marginRight: 12
                                        }}>P.F. Applicable?</label>
                                        <Select
                                            value={form.pfApplicable}
                                            onChange={(val) => handleInputChange("pfApplicable", val)}
                                            style={{ width: "100%", backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            options={[{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }]}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                </Col>

                                <Col span={4}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", marginRight: 12
                                        }}>Ceiling?</label>
                                        <Select
                                            value={form.ceiling}
                                            onChange={(val) => handleInputChange("ceiling", val)}
                                            style={{ width: "100%", backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            options={[{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }]}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                </Col> */}

                                {/* Continue same for ESI, Weekly Off, and Calculation Mode */}
                                {/* <Col span={8}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", marginRight: 12
                                        }}>P.F Code</label>
                                        <Input
                                            value={form.esiNo}
                                            onChange={(e) => handleInputChange("esiNo", e.target.value)}
                                            style={{ flex: 1, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                </Col> */}

                                {/* PF No */}
                                {/* <Col span={8}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>E.S.I. No.</label>
                                        <Input
                                            value={form.pfNo}
                                            onChange={(e) => handleInputChange("pfNo", e.target.value)}
                                            style={{ flex: 1, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                </Col>

                                <Col span={4}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", marginRight: 12
                                        }}>E.S.I. Applicable?</label>
                                        <Select
                                            value={form.esiApplicable}
                                            onChange={(val) => handleInputChange("esiApplicable", val)}
                                            style={{ width: "100%", backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            options={[{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }]}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                </Col>

                                <Col span={4} />

                                <Col span={4}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", marginRight: 12
                                        }}>E.S.I. Code</label>
                                        <Input
                                            value={form.esiCode}
                                            onChange={(e) => handleInputChange("esiCode", e.target.value)}
                                            style={{ flex: 1, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                </Col>

                                <Col span={8}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>Weekly Off</label>
                                        <Input
                                            value={form.weeklyOff}
                                            onChange={(e) => handleInputChange("weeklyOff", e.target.value)}
                                            style={{ flex: 1, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                </Col>

                                <Col span={4}></Col>
                                <Col span={4}></Col>

                                <Col span={8}>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", marginRight: 8
                                        }}><strong>Calculation Mode</strong></span>
                                        <Select
                                            value={form.calculationMode}
                                            onChange={(val) => handleInputChange("calculationMode", val)}
                                            style={{ width: '100%', backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }} // or adjust as needed
                                            options={[
                                                { label: "Automatic", value: "Automatic" },
                                                { label: "Manual", value: "Manual" },
                                            ]}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>

                                </Col> */}


                                <div style={{ marginTop: 20 }}>
                                    <Table
                                        dataSource={dataSource}
                                        columns={columns}
                                        pagination={false}
                                        bordered
                                        rowClassName={() => 'no-padding-row'}

                                    />
                                </div>

                                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                        <p style={{ marginTop: 'unset', marginBottom: 'unset' }}> Opening Balance </p>
                                        <Table
                                            dataSource={dataSourcee}
                                            columns={columnss}
                                            pagination={false}
                                            bordered
                                            showHeader={false}
                                            rowClassName={() => 'no-padding-row'}

                                        />
                                        <style jsx>{`
  .no-padding-row td {
    padding: 0 !important;
  }
`}</style>
                                    </div>
                                </div>

                            </Row>
                            <FooterAdmin />

                        </TabPane>



                        <TabPane tab="General" key="general">
                            <Row gutter={[24, 16]} style={{ padding: 25, rowGap: 2, minHeight: 500 }}>

                                {/* Name */}
                                <Col span={16}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>Name</label>
                                        <Input.Group compact style={{ flex: 1 }}>
                                            <Input
                                                value={form.name}
                                                onChange={(e) => handleInputChange("name", e.target.value)}
                                                style={{ width: "calc(100% - 200px)", backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                disabled={false}
                                                readOnly={viewMode === "ViewOnly"}
                                            />
                                            <Input
                                                value={form.nameCode}
                                                onChange={(e) => handleInputChange("nameCode", e.target.value)}
                                                style={{ width: 200, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                disabled={false}
                                                readOnly={viewMode === "ViewOnly"}
                                            />
                                        </Input.Group>
                                    </div>
                                </Col>
                                <Col span={8} style={{ textAlign: "right", }}>
                                    <Button icon={<ZoomInOutlined />}>Find</Button>
                                </Col>

                                {/* Father's Name */}
                                <Col span={16}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>Father's Name</label>
                                        <Input
                                            value={form.fatherName}
                                            onChange={(e) => handleInputChange("fatherName", e.target.value)}
                                            style={{ flex: 1, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            disabled={false}
                                            readOnly={viewMode === "ViewOnly"}
                                        />

                                    </div>
                                </Col>



                                {/* Designation */}
                                <Col span={16}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>Designation</label>
                                        <Input
                                            value={form.designation}
                                            onChange={(e) => handleInputChange("designation", e.target.value)}
                                            style={{ flex: 1, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                </Col>

                                {/* DOJ */}
                                <Col span={8}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>D.O.J. :</label>
                                        <Text>12-09-2024</Text>
                                    </div>
                                </Col>

                                {/* <Col span={8} /> */}

                                {/* Sub-Designation */}
                                <Col span={16}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>Sub-Designation</label>
                                        <Input.Group compact style={{ flex: 1 }}>
                                            <Input
                                                value={form.subDesignation}
                                                onChange={(e) => handleInputChange("subDesignation", e.target.value)}
                                                style={{ width: "calc(100% - 50px)", backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                type="number"
                                                value={form.subDesignationCode}
                                                onChange={(e) => handleInputChange("subDesignationCode", e.target.value)}
                                                style={{ width: 50, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                </Col>

                                <Col span={8}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>D.O.L. :</label>
                                        <Text>- -</Text>
                                    </div>
                                </Col>

                                {/* <Col span={8} /> */}

                                {/* Company */}
                                <Col span={16}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>Company</label>
                                        <Input.Group compact style={{ flex: 1 }}>
                                            <Input
                                                value={form.company}
                                                onChange={(e) => handleInputChange("company", e.target.value)}
                                                style={{ width: "calc(100% - 50px)", backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                type="number"
                                                value={form.companyCode}
                                                onChange={(e) => handleInputChange("companyCode", e.target.value)}
                                                style={{ width: 50, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>D.O.C. :</label>
                                        <Text>12-09-2024</Text>
                                    </div>
                                </Col>

                                <Col span={16}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>Branch/Unit</label>
                                        <Input.Group compact style={{ flex: 1 }}>
                                            <Input
                                                value={form.branch}
                                                onChange={(e) => handleInputChange("company", e.target.value)}
                                                style={{ width: "calc(100% - 50px)", backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                type="number"
                                                value={form.branchCode}
                                                onChange={(e) => handleInputChange("companyCode", e.target.value)}
                                                style={{ width: 50, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                </Col>

                                <Col span={16}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>Department</label>
                                        <Input.Group compact style={{ flex: 1 }}>
                                            <Input
                                                value={form.department}
                                                onChange={(e) => handleInputChange("company", e.target.value)}
                                                style={{ width: "calc(100% - 50px)", backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                type="number"
                                                value={form.departmentCode}
                                                onChange={(e) => handleInputChange("companyCode", e.target.value)}
                                                style={{ width: 50, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                </Col>

                                <Col span={16}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>Sub-Department</label>
                                        <Input.Group compact style={{ flex: 1 }}>
                                            <Input
                                                value={form.subDepartment}
                                                onChange={(e) => handleInputChange("company", e.target.value)}
                                                style={{ width: "calc(100% - 50px)", backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                type="number"
                                                value={form.subDepartmentCode}
                                                onChange={(e) => handleInputChange("companyCode", e.target.value)}
                                                style={{ width: 50, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                </Col>

                                <Col span={16}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>Location</label>
                                        <Input.Group compact style={{ flex: 1 }}>
                                            <Input
                                                value={form.location}
                                                onChange={(e) => handleInputChange("company", e.target.value)}
                                                style={{ width: "calc(100% - 50px)", backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                type="number"
                                                value={form.locationCode}
                                                onChange={(e) => handleInputChange("companyCode", e.target.value)}
                                                style={{ width: 50, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                </Col>



                                <Col span={4} />

                                {/* PF No */}
                                <Col span={8}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>P.F. No.</label>
                                        <Input
                                            value={form.pfNo}
                                            onChange={(e) => handleInputChange("pfNo", e.target.value)}
                                            style={{ flex: 1, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                </Col>

                                <Col span={4}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", marginRight: 12
                                        }}>P.F. Applicable?</label>
                                        <Select
                                            value={form.pfApplicable}
                                            onChange={(val) => handleInputChange("pfApplicable", val)}
                                            style={{ width: "100%", backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            options={[{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }]}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                </Col>

                                <Col span={4}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", marginRight: 12
                                        }}>Ceiling?</label>
                                        <Select
                                            value={form.ceiling}
                                            onChange={(val) => handleInputChange("ceiling", val)}
                                            style={{ width: "100%", backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            options={[{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }]}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                </Col>

                                {/* Continue same for ESI, Weekly Off, and Calculation Mode */}
                                <Col span={8}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", marginRight: 12
                                        }}>P.F Code</label>
                                        <Input
                                            value={form.esiNo}
                                            onChange={(e) => handleInputChange("esiNo", e.target.value)}
                                            style={{ flex: 1, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                </Col>

                                {/* PF No */}
                                <Col span={8}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>E.S.I. No.</label>
                                        <Input
                                            value={form.pfNo}
                                            onChange={(e) => handleInputChange("pfNo", e.target.value)}
                                            style={{ flex: 1, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                </Col>

                                <Col span={4}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", marginRight: 12
                                        }}>E.S.I. Applicable?</label>
                                        <Select
                                            value={form.esiApplicable}
                                            onChange={(val) => handleInputChange("esiApplicable", val)}
                                            style={{ width: "100%", backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            options={[{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }]}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                </Col>

                                <Col span={4} />

                                <Col span={4}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", marginRight: 12
                                        }}>E.S.I. Code</label>
                                        <Input
                                            value={form.esiCode}
                                            onChange={(e) => handleInputChange("esiCode", e.target.value)}
                                            style={{ flex: 1, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                </Col>

                                <Col span={8}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>Weekly Off</label>
                                        <Input
                                            value={form.weeklyOff}
                                            onChange={(e) => handleInputChange("weeklyOff", e.target.value)}
                                            style={{ flex: 1, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                </Col>

                                <Col span={4}></Col>
                                <Col span={4}></Col>

                                <Col span={8}>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", marginRight: 8
                                        }}><strong>Calculation Mode</strong></span>
                                        <Select
                                            value={form.calculationMode}
                                            onChange={(val) => handleInputChange("calculationMode", val)}
                                            style={{ width: '100%', backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }} // or adjust as needed
                                            options={[
                                                { label: "Automatic", value: "Automatic" },
                                                { label: "Manual", value: "Manual" },
                                            ]}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>

                                </Col>

                            </Row>
                            <FooterAdmin />
                        </TabPane>


                        <TabPane tab="Days Payable" key="daysPayable">
                            <Row gutter={[24, 16]} style={{ padding: 25, rowGap: 2, minHeight: 500 }}>

                                {/* Total Days */}
                                <Col span={8} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            width: 200, whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", marginRight: 12
                                        }}>Total Days</label>
                                        <Input
                                            value={form.totalDays}
                                            onChange={(e) => handleInputChange("totalDays", e.target.value)}
                                            style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>Present</label>
                                        <Input
                                            value={form.present}
                                            onChange={(e) => handleInputChange("present", e.target.value)}
                                            style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>Absent</label>
                                        <Input
                                            value={form.absent}
                                            onChange={(e) => handleInputChange("absent", e.target.value)}
                                            style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>Holidays</label>
                                        <Input
                                            value={form.holidays}
                                            onChange={(e) => handleInputChange("holidays", e.target.value)}
                                            style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            width: 200, whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", marginRight: 12
                                        }}>Weekly Off</label>
                                        <Input
                                            value={form.weeklyOff}
                                            onChange={(e) => handleInputChange("weeklyOff", e.target.value)}
                                            style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>C.L.</label>
                                        <Input
                                            value={form.cl}
                                            onChange={(e) => handleInputChange("cl", e.target.value)}
                                            style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>E.L.</label>
                                        <Input
                                            value={form.el}
                                            onChange={(e) => handleInputChange("el", e.target.value)}
                                            style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>S.L.</label>
                                        <Input
                                            value={form.sl}
                                            onChange={(e) => handleInputChange("sl", e.target.value)}
                                            style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            width: 200, whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", marginRight: 12
                                        }}>More Leave [MOL]</label>
                                        <Input
                                            value={form.moreLeaveMOL}
                                            onChange={(e) => handleInputChange("moreLeaveMOL", e.target.value)}
                                            style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            width: 200, whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", marginRight: 12
                                        }}>Compensatory Off</label>
                                        <Input
                                            value={form.compensatoryOff}
                                            onChange={(e) => handleInputChange("compensatoryOff", e.target.value)}
                                            style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>Payable</label>
                                        <Input
                                            value={form.payable}
                                            onChange={(e) => handleInputChange("payable", e.target.value)}
                                            style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            width: 200, whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", marginRight: 12
                                        }}></label>
                                        <div style={{ width: 200, height: 32 }}></div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}></label>
                                        <div style={{ width: 200, height: 32 }}></div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}>Absent</label>
                                        <div style={{ width: 200, height: 32 }}></div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}></label>
                                        <div style={{ width: 200, height: 32 }}></div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            width: 200, whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", marginRight: 12
                                        }}></label>
                                        <div style={{ width: 200, height: 32 }}></div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}></label>
                                        <div style={{ width: 200, height: 32 }}></div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12, color: 'blue', fontSize: 10 }}>C.L./E.L./S.L. Leave Dates</label>
                                        <div style={{ width: 200, height: 32 }}></div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12, color: 'blue', fontSize: 10 }}>{'More Leaves [MOL] Detail'}</label>
                                        <div style={{ width: 200, height: 32 }}></div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            width: 200, whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", marginRight: 12
                                        }}></label>
                                        <div style={{ width: 200, height: 32 }}></div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            width: 200, whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", marginRight: 12
                                        }}></label>
                                        <div style={{ width: 200, height: 32 }}></div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}></label>
                                        <div style={{ width: 200, height: 32 }}></div>
                                    </div>
                                </Col>

                                {/* Calculation Mode (Unchanged) */}
                                <Col span={8}>
                                    <div style={{ border: '1px solid #ccc', padding: 10, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 5 }}>
                                        <Text strong >Opening</Text>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <label style={{
                                                width: 200, whiteSpace: "nowrap",
                                                textOverflow: "ellipsis", marginRight: 12
                                            }}>C.L</label>
                                            <Input
                                                value={form.totalDays}
                                                onChange={(e) => handleInputChange("totalDays", e.target.value)}
                                                style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <label style={{ width: 200, marginRight: 12 }}>E.L</label>
                                            <Input
                                                value={form.present}
                                                onChange={(e) => handleInputChange("present", e.target.value)}
                                                style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <label style={{ width: 200, marginRight: 12 }}>S.L</label>
                                            <Input
                                                value={form.absent}
                                                onChange={(e) => handleInputChange("absent", e.target.value)}
                                                style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ border: '1px solid #ccc', padding: 10, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 5 }}>
                                        <Text strong >Closing</Text>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <label style={{
                                                width: 200, whiteSpace: "nowrap",
                                                textOverflow: "ellipsis", marginRight: 12
                                            }}>C.L</label>
                                            <Input
                                                value={form.totalDays}
                                                onChange={(e) => handleInputChange("totalDays", e.target.value)}
                                                style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <label style={{ width: 200, marginRight: 12 }}>E.L</label>
                                            <Input
                                                value={form.present}
                                                onChange={(e) => handleInputChange("present", e.target.value)}
                                                style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <label style={{ width: 200, marginRight: 12 }}>S.L</label>
                                            <Input
                                                value={form.absent}
                                                onChange={(e) => handleInputChange("absent", e.target.value)}
                                                style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", marginRight: 8
                                        }}><strong>Calculation Mode</strong></span>
                                        <Select
                                            value={form.calculationMode}
                                            onChange={(val) => handleInputChange("calculationMode", val)}
                                            options={[
                                                { label: "Automatic", value: "Automatic" },
                                                { label: "Manual", value: "Manual" },
                                            ]}
                                            style={{ width: '100%', backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                </Col>

                            </Row>

                            <FooterAdmin />
                        </TabPane>

                        <TabPane tab="Allowances" key="allowances">
                            <Row gutter={[24, 16]} style={{ padding: 25, rowGap: 2, minHeight: 500 }}>
                                <Col span={12} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 10 }}>
                                        <Text></Text>
                                        <Text strong style={{ fontWeight: 700 }}>Earned</Text>
                                        <Text strong style={{ fontWeight: 700 }}>Rates</Text>
                                        <Text strong style={{ fontWeight: 700 }}>Arrears</Text>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 110, marginRight: 12
                                        }}>Basic Salary</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.basicSalaryEarned}
                                                onChange={(e) => handleInputChange("basicSalaryEarned", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.basicSalaryRate}
                                                onChange={(e) => handleInputChange("basicSalaryRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.basicSalaryArrears}
                                                onChange={(e) => handleInputChange("basicSalaryArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 110, marginRight: 12
                                        }}>D.A</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.daEarned}
                                                onChange={(e) => handleInputChange("daEarned", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.daRate}
                                                onChange={(e) => handleInputChange("daRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.daArrears}
                                                onChange={(e) => handleInputChange("daArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 110, marginRight: 12
                                        }}>H.R.A.</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.hraEarned}
                                                onChange={(e) => handleInputChange("hraEarned", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.hraRate}
                                                onChange={(e) => handleInputChange("hraRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.hraArrears}
                                                onChange={(e) => handleInputChange("hraArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 110, marginRight: 12
                                        }}>C.C.A.</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.ccaEarned}
                                                onChange={(e) => handleInputChange("ccaEarned", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.ccaRate}
                                                onChange={(e) => handleInputChange("ccaRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.ccaArrears}
                                                onChange={(e) => handleInputChange("ccaArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 110, marginRight: 12
                                        }}>Tpt. Alow.</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.transportAllowanceEarned}
                                                onChange={(e) => handleInputChange("transportAllowanceEarned", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.transportAllowanceRate}
                                                onChange={(e) => handleInputChange("transportAllowanceRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.transportAllowanceArrears}
                                                onChange={(e) => handleInputChange("transportAllowanceArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 110, marginRight: 12
                                        }}>E.L. days</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.elDaysEarned}
                                                onChange={(e) => handleInputChange("elDaysEarned", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.elDaysRate}
                                                onChange={(e) => handleInputChange("elDaysRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.elDaysArrears}
                                                onChange={(e) => handleInputChange("elDaysArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 110, marginRight: 12
                                        }}>E.L. Amount</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.elAmountEarned}
                                                onChange={(e) => handleInputChange("elAmountEarned", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.elAmountRate}
                                                onChange={(e) => handleInputChange("elAmountRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.elAmountArrears}
                                                onChange={(e) => handleInputChange("elAmountArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 110, marginRight: 12
                                        }}>Net Arrears</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.netArrearsEarned}
                                                onChange={(e) => handleInputChange("netArrearsEarned", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.netArrearsRate}
                                                onChange={(e) => handleInputChange("netArrearsRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.netArrearsArrears}
                                                onChange={(e) => handleInputChange("netArrearsArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                disabled={viewMode === "ViewOnly"}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 110, marginRight: 12
                                        }}>P.F/E.S.I</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.pfEsiEarned}
                                                onChange={(e) => handleInputChange("pfEsiEarned", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.pfEsiRate}
                                                onChange={(e) => handleInputChange("pfEsiRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.pfEsiArrears}
                                                onChange={(e) => handleInputChange("pfEsiArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 110, marginRight: 12
                                        }}>O.T Hours</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.otHoursEarned}
                                                onChange={(e) => handleInputChange("otHoursEarned", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.otHoursRate}
                                                onChange={(e) => handleInputChange("otHoursRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.otHoursArrears}
                                                onChange={(e) => handleInputChange("otHoursArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 110, marginRight: 12
                                        }}>O.T Amount</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.otAmountEarned}
                                                onChange={(e) => handleInputChange("otAmountEarned", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.otAmountRate}
                                                onChange={(e) => handleInputChange("otAmountRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.otAmountArrears}
                                                onChange={(e) => handleInputChange("otAmountArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                </Col>
                                <Col span={12} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 10 }}>
                                        <Text></Text>
                                        <Text strong style={{ fontWeight: 700 }}>Earned</Text>
                                        <Text strong style={{ fontWeight: 700 }}>Rates</Text>
                                        <Text strong style={{ fontWeight: 700 }}>Arrears</Text>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 160, marginRight: 12
                                        }}>Medical Allowance</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.medicalAllowanceEarned}
                                                onChange={(e) => handleInputChange("medicalAllowanceEarned", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.medicalAllowanceRate}
                                                onChange={(e) => handleInputChange("medicalAllowanceRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.medicalAllowanceArrears}
                                                onChange={(e) => handleInputChange("medicalAllowanceArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 160, marginRight: 12
                                        }}>Incentive</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.incentiveEarned}
                                                onChange={(e) => handleInputChange("incentiveEarned", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.incentiveRate}
                                                onChange={(e) => handleInputChange("incentiveRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.incentiveArrears}
                                                onChange={(e) => handleInputChange("incentiveArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 160, marginRight: 12
                                        }}>Fooding Allowance</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.foodingAllowanceEarned}
                                                onChange={(e) => handleInputChange("foodingAllowanceEarned", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.foodingAllowanceRate}
                                                onChange={(e) => handleInputChange("foodingAllowanceRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.foodingAllowanceArrears}
                                                onChange={(e) => handleInputChange("foodingAllowanceArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 160, marginRight: 12
                                        }}>Special Allowance</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.specialAllowanceEarned}
                                                onChange={(e) => handleInputChange("specialAllowanceEarned", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.specialAllowanceRate}
                                                onChange={(e) => handleInputChange("specialAllowanceRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.specialAllowanceArrears}
                                                onChange={(e) => handleInputChange("specialAllowanceArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 160, marginRight: 12
                                        }}>Extra Allowance</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.extraAllowanceEarned}
                                                onChange={(e) => handleInputChange("extraAllowanceEarned", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.extraAllowanceRate}
                                                onChange={(e) => handleInputChange("extraAllowanceRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.extraAllowanceArrears}
                                                onChange={(e) => handleInputChange("extraAllowanceArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 160, marginRight: 12
                                        }}>Leave Encashment</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.leaveEncashmentEarned}
                                                onChange={(e) => handleInputChange("leaveEncashmentEarned", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.leaveEncashmentRate}
                                                onChange={(e) => handleInputChange("leaveEncashmentRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.leaveEncashmentArrears}
                                                onChange={(e) => handleInputChange("leaveEncashmentArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 160, marginRight: 12
                                        }}>Medical Rem</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.medicalRemEarned}
                                                onChange={(e) => handleInputChange("medicalRemEarned", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.medicalRemRate}
                                                onChange={(e) => handleInputChange("medicalRemRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.medicalRemArrears}
                                                onChange={(e) => handleInputChange("medicalRemArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 160, marginRight: 12
                                        }}>Lta</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.ltaEarned}
                                                onChange={(e) => handleInputChange("ltaEarned", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.ltaRate}
                                                onChange={(e) => handleInputChange("ltaRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.ltaArrears}
                                                onChange={(e) => handleInputChange("ltaArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 160, marginRight: 12
                                        }}>Bonus/Ex-Gratia</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.bonusExGratiaEarned}
                                                onChange={(e) => handleInputChange("bonusExGratiaEarned", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.bonusExGratiaRate}
                                                onChange={(e) => handleInputChange("bonusExGratiaRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.bonusExGratiaArrears}
                                                onChange={(e) => handleInputChange("bonusExGratiaArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 160, marginRight: 12
                                        }}>Cca</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.ccaEarned}
                                                onChange={(e) => handleInputChange("ccaEarned", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.ccaRate}
                                                onChange={(e) => handleInputChange("ccaRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.ccaArrears}
                                                onChange={(e) => handleInputChange("ccaArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 160, marginRight: 12
                                        }}>O.T Amount</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.otAmountEarned}
                                                onChange={(e) => handleInputChange("otAmountEarned", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.otAmountRate}
                                                onChange={(e) => handleInputChange("otAmountRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.otAmountArrears}
                                                onChange={(e) => handleInputChange("otAmountArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                </Col>
                            </Row>

                            <FooterAdmin />
                        </TabPane>

                        <TabPane tab="Deductions" key="deductions">
                            <Row gutter={[24, 16]} style={{ padding: 25, rowGap: 2, minHeight: 500 }}>
                                <Col span={12} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 10 }}>
                                        <Text></Text>
                                        <Text></Text>
                                        <Text></Text>
                                        <Text strong style={{ fontWeight: 700 }}>Deduction</Text>
                                        <Text strong style={{ fontWeight: 700 }}>Employer Contbn.</Text>
                                        <Text strong style={{ fontWeight: 700 }}>Arrears</Text>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", width: 150, marginRight: 12 }}>Monthly T.D.S.</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.monthlyTdsDeduction}
                                                onChange={(e) => handleInputChange("monthlyTdsDeduction", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.monthlyTdsEmployerContbn}
                                                onChange={(e) => handleInputChange("monthlyTdsEmployerContbn", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.monthlyTdsArrears}
                                                onChange={(e) => handleInputChange("monthlyTdsArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", width: 150, marginRight: 12 }}>T.D.S. Dedu.</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.tdsDeduDeduction}
                                                onChange={(e) => handleInputChange("tdsDeduDeduction", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.tdsDeduEmployerContbn}
                                                onChange={(e) => handleInputChange("tdsDeduEmployerContbn", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.tdsDeduArrears}
                                                onChange={(e) => handleInputChange("tdsDeduArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", width: 150, marginRight: 12 }}>E.P.F. Salary</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.epfSalaryDeduction}
                                                onChange={(e) => handleInputChange("epfSalaryDeduction", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.epfSalaryEmployerContbn}
                                                onChange={(e) => handleInputChange("epfSalaryEmployerContbn", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.epfSalaryArrears}
                                                onChange={(e) => handleInputChange("epfSalaryArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", width: 150, marginRight: 12 }}>E.P.Fund</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.epFundDeduction}
                                                onChange={(e) => handleInputChange("epFundDeduction", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.epFundEmployerContbn}
                                                onChange={(e) => handleInputChange("epFundEmployerContbn", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.epFundArrears}
                                                onChange={(e) => handleInputChange("epFundArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", width: 150, marginRight: 12 }}>Pension Salary</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.pensionSalaryDeduction}
                                                onChange={(e) => handleInputChange("pensionSalaryDeduction", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.pensionSalaryEmployerContbn}
                                                onChange={(e) => handleInputChange("pensionSalaryEmployerContbn", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.pensionSalaryArrears}
                                                onChange={(e) => handleInputChange("pensionSalaryArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", width: 150, marginRight: 12 }}>F.P Fund</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.fpFundDeduction}
                                                onChange={(e) => handleInputChange("fpFundDeduction", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.fpFundEmployerContbn}
                                                onChange={(e) => handleInputChange("fpFundEmployerContbn", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.fpFundArrears}
                                                onChange={(e) => handleInputChange("fpFundArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", width: 150, marginRight: 12 }}>E.S.I Salary</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.esiSalaryDeduction}
                                                onChange={(e) => handleInputChange("esiSalaryDeduction", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.esiSalaryEmployerContbn}
                                                onChange={(e) => handleInputChange("esiSalaryEmployerContbn", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.esiSalaryArrears}
                                                onChange={(e) => handleInputChange("esiSalaryArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", width: 150, marginRight: 12 }}>E.S.I</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.esiDeduction}
                                                onChange={(e) => handleInputChange("esiDeduction", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.esiEmployerContbn}
                                                onChange={(e) => handleInputChange("esiEmployerContbn", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.esiArrears}
                                                onChange={(e) => handleInputChange("esiArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    {/* ///add/// */}
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", width: 150, marginRight: 12 }}>Monthly Advance</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.monthly_Advance_Deduction}
                                                onChange={(e) => handleInputChange("monthly_Advance_Deduction", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.monthly_Advance_EmployerContbn}
                                                onChange={(e) => handleInputChange("monthly_Advance_EmployerContbn", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.monthly_Advance_Arrears}
                                                onChange={(e) => handleInputChange("monthly_Advance_Arrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", width: 150, marginRight: 12 }}>Advance Dedu.</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.advance_dedu_Deduction}
                                                onChange={(e) => handleInputChange("advance_dedu_Deduction", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.advance_dedu_EmployerContbn}
                                                onChange={(e) => handleInputChange("advance_dedu_EmployerContbn", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.advance_dedu_Arrears}
                                                onChange={(e) => handleInputChange("advance_dedu_Arrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", width: 150, marginRight: 12 }}>Loan Installment</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.loan_installment_Deduction}
                                                onChange={(e) => handleInputChange("loan_installment_Deduction", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.loan_installment_EmployerContbn}
                                                onChange={(e) => handleInputChange("loan_installment_EmployerContbn", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.loan_installment_Arrears}
                                                onChange={(e) => handleInputChange("loan_installment_Arrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", width: 150, marginRight: 12 }}>Loan Inst. Dedu.</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.loan_inst_dedu_Deduction}
                                                onChange={(e) => handleInputChange("loan_inst_dedu_Deduction", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                // value={form.advance_dedu_EmployerContbn}
                                                // onChange={(e) => handleInputChange("advance_dedu_EmployerContbn", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={true}
                                            />
                                            <Input
                                                // value={form.advance_dedu_Arrears}
                                                // onChange={(e) => handleInputChange("advance_dedu_Arrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={true}
                                            />
                                        </Input.Group>
                                    </div>

                                </Col>
                                <Col span={12} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 10 }}>
                                        <Text></Text>
                                        <Text></Text>
                                        <Text strong style={{ fontWeight: 700 }}>Deduction</Text>
                                        <Text strong style={{ fontWeight: 700 }}>Rates</Text>
                                        <Text strong style={{ fontWeight: 700 }}>Arrears</Text>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", width: 160, marginRight: 12 }}>P.Tax</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.pTaxDeduction}
                                                onChange={(e) => handleInputChange("pTaxDeduction", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.pTaxRate}
                                                onChange={(e) => handleInputChange("pTaxRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.pTaxArrears}
                                                onChange={(e) => handleInputChange("pTaxArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", width: 160, marginRight: 12 }}>L.W.F.</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.lwfDeduction}
                                                onChange={(e) => handleInputChange("lwfDeduction", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.lwfRate}
                                                onChange={(e) => handleInputChange("lwfRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.lwfArrears}
                                                onChange={(e) => handleInputChange("lwfArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", width: 160, marginRight: 12 }}>Inc.Paid</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.incPaidDeduction}
                                                onChange={(e) => handleInputChange("incPaidDeduction", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.incPaidRate}
                                                onChange={(e) => handleInputChange("incPaidRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.incPaidArrears}
                                                onChange={(e) => handleInputChange("incPaidArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", width: 160, marginRight: 12 }}>TDS</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.tdsDeduction}
                                                onChange={(e) => handleInputChange("tdsDeduction", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.tdsRate}
                                                onChange={(e) => handleInputChange("tdsRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.tdsArrears}
                                                onChange={(e) => handleInputChange("tdsArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", width: 160, marginRight: 12 }}>ESI</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.esiRebateDeduction}
                                                onChange={(e) => handleInputChange("esiRebateDeduction", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.esiRebateRate}
                                                onChange={(e) => handleInputChange("esiRebateRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.esiRebateArrears}
                                                onChange={(e) => handleInputChange("esiRebateArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", width: 160, marginRight: 12 }}>Recovery</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.recoveryDeduction}
                                                onChange={(e) => handleInputChange("recoveryDeduction", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.recoveryRate}
                                                onChange={(e) => handleInputChange("recoveryRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.recoveryArrears}
                                                onChange={(e) => handleInputChange("recoveryArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", width: 160, marginRight: 12 }}>Cash Short</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.cashShortDeduction}
                                                onChange={(e) => handleInputChange("cashShortDeduction", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.cashShortRate}
                                                onChange={(e) => handleInputChange("cashShortRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.cashShortArrears}
                                                onChange={(e) => handleInputChange("cashShortArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", width: 160, marginRight: 12 }}>Diesel Deductio</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.dieselDeduction}
                                                onChange={(e) => handleInputChange("dieselDeduction", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.dieselRate}
                                                onChange={(e) => handleInputChange("dieselRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.dieselArrears}
                                                onChange={(e) => handleInputChange("dieselArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", width: 160, marginRight: 12 }}>Penalty</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.penaltyDeduction}
                                                onChange={(e) => handleInputChange("penaltyDeduction", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.penaltyRate}
                                                onChange={(e) => handleInputChange("penaltyRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.penaltyArrears}
                                                onChange={(e) => handleInputChange("penaltyArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", width: 160, marginRight: 12 }}>LWF</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.lwfRebateDeduction}
                                                onChange={(e) => handleInputChange("lwfRebateDeduction", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.lwfRebateRate}
                                                onChange={(e) => handleInputChange("lwfRebateRate", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.lwfRebateArrears}
                                                onChange={(e) => handleInputChange("lwfRebateArrears", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                </Col>
                            </Row>

                            <FooterAdmin />
                        </TabPane>


                        <TabPane tab="Net Salary" key="netSalary">
                            <Row gutter={[24, 16]} style={{ padding: 25, rowGap: 2, minHeight: 500 }}>

                                {/* Total Days */}
                                <Col span={8}>
                                    <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <label style={{
                                                width: 200, whiteSpace: "nowrap",
                                                textOverflow: "ellipsis", marginRight: 12
                                            }}>Gross Salary</label>
                                            <Input
                                                value={form.grossSalary}
                                                onChange={(e) => handleInputChange("grossSalary", e.target.value)}
                                                style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <label style={{ width: 200, marginRight: 12 }}>Deductions</label>
                                            <Input
                                                value={form.deductions}
                                                onChange={(e) => handleInputChange("deductions", e.target.value)}
                                                style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <label style={{ width: 200, marginRight: 12 }}>Net Salary</label>
                                            <Input
                                                value={form.netSalary}
                                                onChange={(e) => handleInputChange("netSalary", e.target.value)}
                                                style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ padding: 10, border: '1px solid #ccc', marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <label style={{ width: 200, marginRight: 12 }}>Payment Mode</label>
                                            <Input
                                                value={form.paymentMode}
                                                onChange={(e) => handleInputChange("paymentMode", e.target.value)}
                                                style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <label style={{
                                                width: 200, whiteSpace: "nowrap",
                                                textOverflow: "ellipsis", marginRight: 12
                                            }}>Instrument No.</label>
                                            <Input
                                                value={form.instrumentNo}
                                                onChange={(e) => handleInputChange("instrumentNo", e.target.value)}
                                                style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <label style={{ width: 200, marginRight: 12 }}>Instrument Date</label>
                                            <Input
                                                value={form.instrumentDate}
                                                onChange={(e) => handleInputChange("instrumentDate", e.target.value)}
                                                style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <label style={{ width: 200, marginRight: 12 }}>Drawn on Bank</label>
                                            <Input
                                                value={form.drawnOnBank}
                                                onChange={(e) => handleInputChange("drawnOnBank", e.target.value)}
                                                style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <label style={{ width: 200, marginRight: 12 }}>Drawn On A/c</label>
                                            <Input
                                                value={form.drawnOnAccount}
                                                onChange={(e) => handleInputChange("drawnOnAccount", e.target.value)}
                                                style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ padding: 10, border: '1px solid #ccc', display: 'flex', flexDirection: 'column', gap: 5 }}>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <label style={{
                                                width: 200, whiteSpace: "nowrap",
                                                textOverflow: "ellipsis", marginRight: 12
                                            }}>Print Voucher</label>
                                            <Input
                                                value={form.printVoucher}
                                                onChange={(e) => handleInputChange("printVoucher", e.target.value)}
                                                style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <label style={{
                                                width: 200, whiteSpace: "nowrap",
                                                textOverflow: "ellipsis", marginRight: 12
                                            }}>Printed 1</label>
                                            <Input
                                                value={form.printed1}
                                                onChange={(e) => handleInputChange("printed1", e.target.value)}
                                                style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <label style={{ width: 200, marginRight: 12 }}>Printed 2</label>
                                            <Input
                                                value={form.printed2}
                                                onChange={(e) => handleInputChange("printed2", e.target.value)}
                                                style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <label style={{ width: 200, marginRight: 12 }}>Printed 3</label>
                                            <Input
                                                value={form.printed3}
                                                onChange={(e) => handleInputChange("printed3", e.target.value)}
                                                style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </div>
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            width: 200, whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", marginRight: 12
                                        }}></label>
                                        <div style={{ width: 200, height: 32 }}></div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}></label>
                                        <div style={{ width: 200, height: 32 }}></div>
                                    </div>
                                    <div style={{ display: "flex", }}>
                                        {/* <label style={{ width: 200, marginRight: 12 }}></label> */}
                                        <div style={{ width: '100%', height: 32, alignItems: "center", textAlign: 'center' }}><Checkbox>Recreate Salary From Master</Checkbox></div>

                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        {/* <label style={{ width: 200, marginRight: 12 }}></label>*/}
                                        <div style={{ width: '100%', height: 32, alignItems: "center", textAlign: 'center' }}><Checkbox>Recalculate</Checkbox></div>

                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            width: 200, whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", marginRight: 12
                                        }}></label>
                                        <div style={{ width: 200, height: 32 }}></div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}></label>
                                        <div style={{ width: 200, height: 32 }}></div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12, color: 'blue', fontSize: 10 }}></label>
                                        <div style={{ width: 200, height: 32 }}></div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12, color: 'blue', fontSize: 10 }}></label>
                                        <div style={{ width: 200, height: 32 }}></div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            width: 200, whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", marginRight: 12
                                        }}></label>
                                        <div style={{ width: 200, height: 32 }}></div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            width: 200, whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", marginRight: 12
                                        }}></label>
                                        <div style={{ width: 200, height: 32 }}></div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{ width: 200, marginRight: 12 }}></label>
                                        <div style={{ width: 200, height: 32 }}></div>
                                    </div>
                                </Col>

                                {/* Calculation Mode (Unchanged) */}
                                <Col span={8}>
                                    <div style={{ padding: '10px', border: '1px solid #ccc', marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                                        <Checkbox
                                            checked={checkedList.includes(options[0])}
                                            onChange={(e) => onChange(e.target.checked ? [options[0]] : [])}
                                        >
                                            {options[0]}
                                        </Checkbox>
                                        <Button onClick={() => {
                                            if (viewMode === 'editOnly') {
                                                setviewMode('ViewOnly')
                                            } else if (viewMode === 'ViewOnly') {
                                                setviewMode('editOnly')
                                            }
                                        }} >
                                            Unlock
                                        </Button>

                                        {options.slice(1).map((option) => (
                                            <Checkbox
                                                key={option}
                                                checked={checkedList.includes(option)}
                                                onChange={(e) => {
                                                    const newList = e.target.checked
                                                        ? [...checkedList, option]
                                                        : checkedList.filter((item) => item !== option);
                                                    onChange(newList);
                                                }}
                                            >
                                                {option}
                                            </Checkbox>
                                        ))}


                                    </div>
                                    <div style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                                        {/* <Text strong >Opening</Text> */}
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <label style={{
                                                width: 200, whiteSpace: "nowrap",
                                                textOverflow: "ellipsis", marginRight: 12
                                            }}>Hold Salary ?</label>
                                            <select
                                                value={form.holdSalary}
                                                onChange={(e) => handleInputChange("holdSalary", e.target.value)}
                                                style={{
                                                    flex: 1,
                                                    padding: "6px 8px",
                                                    borderRadius: 4,
                                                    border: "1px solid #ccc",
                                                    width: "100%",
                                                    backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto",
                                                }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            >
                                                <option value="">Select</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <label style={{ width: 200, marginRight: 12 }}>Reason</label>
                                            <Input
                                                value={form.holdSalary_reason}
                                                onChange={(e) => handleInputChange("holdSalary_reason", e.target.value)}
                                                style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                                        {/* <Text strong >Closing</Text> */}
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <label style={{
                                                width: 200, whiteSpace: "nowrap",
                                                textOverflow: "ellipsis", marginRight: 12
                                            }}>Paid ?</label>
                                            <select
                                                value={form.paid}
                                                onChange={(e) => handleInputChange("paid", e.target.value)}
                                                style={{
                                                    flex: 1,
                                                    padding: "6px 8px",
                                                    borderRadius: 4,
                                                    border: "1px solid #ccc",
                                                    width: "100%"
                                                }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            >
                                                <option value="">Select</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <label style={{ width: 200, marginRight: 12, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}>Paid On</label>
                                            <Input
                                                value={form.paidOn}
                                                onChange={(e) => handleInputChange("paidOn", e.target.value)}
                                                style={{ backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", marginRight: 8
                                        }}><strong>Calculation Mode</strong></span>
                                        <Select
                                            value={form.calculationMode}
                                            onChange={(val) => handleInputChange("calculationMode", val)}
                                            style={{ width: '100%', backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                            options={[
                                                { label: "Automatic", value: "Automatic" },
                                                { label: "Manual", value: "Manual" },
                                            ]}
                                            readOnly={viewMode === "ViewOnly"}
                                            disabled={false}
                                        />
                                    </div>
                                </Col>

                            </Row>

                            <FooterAdmin />
                        </TabPane>

                        <TabPane tab="Reimbursement" key="reimbursement">
                            <Row gutter={[24, 16]} style={{ padding: 25, rowGap: 2, minHeight: 500 }}>
                                <Col span={12} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 10 }}>
                                        <Text></Text>
                                        <Text></Text>
                                        <Text strong style={{ fontWeight: 700 }}>Rate/Month</Text>
                                        <Text strong style={{ fontWeight: 700 }}>Deposited</Text>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 170, marginRight: 12
                                        }}>Medical</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.medical_rate_month}
                                                onChange={(e) => handleInputChange("medical_rate_month", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.medical_deposited}
                                                onChange={(e) => handleInputChange("medical_deposited", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 170, marginRight: 12
                                        }}>Fuel & Maintenance</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.fuel_maintenance_rate_month}
                                                onChange={(e) => handleInputChange("fuel_maintenance_rate_month", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.fuel_maintenance_deposited}
                                                onChange={(e) => handleInputChange("fuel_maintenance_deposited", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 170, marginRight: 12
                                        }}>Books & Periodicals</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.books_periodicals_rate_month}
                                                onChange={(e) => handleInputChange("books_periodicals_rate_month", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.books_periodicals_deposited}
                                                onChange={(e) => handleInputChange("books_periodicals_deposited", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 170, marginRight: 12
                                        }}>Professional Attire</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.professional_attire_rate_month}
                                                onChange={(e) => handleInputChange("professional_attire_rate_month", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.professional_attire_deposited}
                                                onChange={(e) => handleInputChange("professional_attire_deposited", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 170, marginRight: 12
                                        }}>Driver Wages</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.driver_wages_rate_month}
                                                onChange={(e) => handleInputChange("driver_wages_rate_month", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.driver_wages_deposited}
                                                onChange={(e) => handleInputChange("driver_wages_deposited", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 170, marginRight: 12
                                        }}>Mobile</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.mobile_rate_month}
                                                onChange={(e) => handleInputChange("mobile_rate_month", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.mobile_deposited}
                                                onChange={(e) => handleInputChange("mobile_deposited", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 170, marginRight: 12
                                        }}>Meal Voucher</label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.meal_voucher_rate_month}
                                                onChange={(e) => handleInputChange("meal_voucher_rate_month", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.meal_voucher_deposited}
                                                onChange={(e) => handleInputChange("meal_voucher_deposited", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                </Col>
                                <Col span={12} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 10 }}>
                                        <Text></Text>
                                        <Text strong style={{ fontWeight: 700 }}>Billed</Text>
                                        <Text strong style={{ fontWeight: 700 }}>Withdrawal</Text>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 160, marginRight: 12
                                        }}><Checkbox>Lock Deposited</Checkbox></label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.medical_billed}
                                                onChange={(e) => handleInputChange("medical_billed", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.medical_withdrawal}
                                                onChange={(e) => handleInputChange("medical_withdrawal", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 160, marginRight: 12
                                        }}><Checkbox>Lock Deposited</Checkbox></label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.fuel_maintenance_billed}
                                                onChange={(e) => handleInputChange("fuel_maintenance_billed", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.fuel_maintenance_withdrawal}
                                                onChange={(e) => handleInputChange("fuel_maintenance_withdrawal", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 160, marginRight: 12
                                        }}><Checkbox>Lock Deposited</Checkbox></label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.books_periodicals_billed}
                                                onChange={(e) => handleInputChange("books_periodicals_billed", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.books_periodicals_withdrawal}
                                                onChange={(e) => handleInputChange("books_periodicals_withdrawal", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 160, marginRight: 12
                                        }}><Checkbox>Lock Deposited</Checkbox></label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.professional_attire_billed}
                                                onChange={(e) => handleInputChange("professional_attire_billed", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.professional_attire_withdrawal}
                                                onChange={(e) => handleInputChange("professional_attire_withdrawal", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 160, marginRight: 12
                                        }}><Checkbox>Lock Deposited</Checkbox></label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.driver_wages_billed}
                                                onChange={(e) => handleInputChange("driver_wages_billed", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.driver_wages_withdrawal}
                                                onChange={(e) => handleInputChange("driver_wages_withdrawal", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 160, marginRight: 12
                                        }}><Checkbox>Lock Deposited</Checkbox></label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.mobile_billed}
                                                onChange={(e) => handleInputChange("mobile_billed", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.mobile_withdrawal}
                                                onChange={(e) => handleInputChange("mobile_withdrawal", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <label style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis", width: 160, marginRight: 12
                                        }}><Checkbox>Lock Deposited</Checkbox></label>
                                        <Input.Group compact style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                            <Input
                                                value={form.meal_voucher_billed}
                                                onChange={(e) => handleInputChange("meal_voucher_billed", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                            <Input
                                                value={form.meal_voucher_withdrawal}
                                                onChange={(e) => handleInputChange("meal_voucher_withdrawal", e.target.value)}
                                                style={{ width: 110, backgroundColor: viewMode === "ViewOnly" ? "#f5f5f5" : '#fff', color: "blackrgba(0,0,0,0.88)", opacity: 1, pointerEvents: viewMode === "ViewOnly" ? "none" : "auto", }}
                                                readOnly={viewMode === "ViewOnly"}
                                                disabled={false}
                                            />
                                        </Input.Group>
                                    </div>
                                </Col>
                            </Row>
                            <FooterAdmin />
                        </TabPane>

                    </Tabs>
                </>}
                                        
        </div>
    );
};

const salaryControl = () => {
    return (
        <Modal
            open={true}
            onCancel={setfullScreen}
            footer={null}
            closable={false}
            width={1200}
            centered
            className="mod_salry"
            bodyStyle={{ padding: 0 }}
            modalRender={(modal) => (
                <Draggable
                    disabled={disabled}
                    handle=".mod_salry-title"
                    nodeRef={draggleRef}
                >
                    <div ref={draggleRef}>{modal}</div>
                </Draggable>
            )}
            title={
                <div
                    className="mod_salry-title"
                    style={{ cursor: "move", width: "100%" }}
                    onMouseOver={() => setDisabled(false)}
                    onMouseOut={() => setDisabled(true)}
                >
                    Salary Control Panel
                </div>
            }
        >
            <SalaryEditControlPanel />
        </Modal>
    )
}

const FooterAdmin = () => {
    return (
        <div style={{ backgroundColor: '#f5f5f5' }}>
            {/* <Divider style={{ margin: 5 }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
                ADMIN
                <br />
                {new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString()}
            </Text> */}
        </div>
    )
}


const columns = [
    {
        title: "Name of Employee",
        dataIndex: "name",
        key: "name",
    },
    {
        title: "Code",
        dataIndex: "code",
        key: "code",
    },
    {
        title: "Designation",
        dataIndex: "designation",
        key: "designation",
    },
    {
        title: "Location",
        dataIndex: "location",
        key: "location",
    },
    {
        title: "Branch",
        dataIndex: "branch",
        key: "branch",
    },
    {
        title: "Department",
        dataIndex: "department",
        key: "department",
    },
];

const data = [
    {
        key: "1",
        name: "MR. HARSHIT BARMAN",
        code: "V30001",
        designation: "LOB MEMBER",
        location: "S/R - KATNI (GOLE BAZAR)",
        branch: "MAIN BRANCH",
        department: "RETAIL OPERATIONS",
    },
    {
        key: "2",
        name: "MR. HARSHIT BARMAN",
        code: "V30001",
        designation: "LOB MEMBER",
        location: "S/R - KATNI (GOLE BAZAR)",
        branch: "MAIN BRANCH",
        department: "RETAIL OPERATIONS",
    },
    {
        key: "3",
        name: "MR. HARSHIT BARMAN",
        code: "V30001",
        designation: "LOB MEMBER",
        location: "S/R - KATNI (GOLE BAZAR)",
        branch: "MAIN BRANCH",
        department: "RETAIL OPERATIONS",
    },
    {
        key: "4",
        name: "MR. HARSHIT BARMAN",
        code: "V30001",
        designation: "LOB MEMBER",
        location: "S/R - KATNI (GOLE BAZAR)",
        branch: "MAIN BRANCH",
        department: "RETAIL OPERATIONS",
    },
    // More rows can be added here
];

const AttachmentSearch = ({ setviewSearch, ...props }) => {
    const [searchName, setSearchName] = useState("");
    const [searchCode, setSearchCode] = useState("");
    const [filteredData, setFilteredData] = useState(data);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const onFilter = () => {
        const filtered = data.filter((item) => {
            return (
                item.name.toLowerCase().includes(searchName.toLowerCase()) &&
                item.code.toLowerCase().includes(searchCode.toLowerCase())
            );
        });
        setFilteredData(filtered);
        setSelectedRowKeys([]);
    };

    const onSelect = () => {
        if (selectedRowKeys.length === 0) {
            alert("Please select an employee.");
            return;
        }
        const selectedEmployee = filteredData.find(
            (item) => item.key === selectedRowKeys[0]
        );
        alert(`Selected Employee:\n${JSON.stringify(selectedEmployee, null, 2)}`);
    };

    const onCancel = () => {
        // Clear all selections and filters
        setSearchName("");
        setSearchCode("");
        setFilteredData(data);
        setSelectedRowKeys([]);
        setviewSearch(false)
    };

    const rowSelection = {
        type: "radio",
        selectedRowKeys,
        onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
        getCheckboxProps: (record) => ({
            disabled: isBlankRow(record), // Prevent selection
            style: isBlankRow(record) ? { display: 'none' } : {}, // Hide radio button
        }),
    };

    const isBlankRow = (record) => {
        // Define your own logic for detecting blank rows
        return !record.key || Object.values(record).every(value => value === null || value === '');
    };
    // - Determine how many blank rows to add


    return (
        <div>
            <Row gutter={16} wrap={false} style={{ marginBottom: 10, alignItems: "center" }}>
                <Col flex="140px">
                    <label
                        htmlFor="searchName"
                        style={{
                            lineHeight: "30px",
                            fontWeight: "600",
                            userSelect: "none",
                            display: "inline-block",
                        }}
                    >
                        Search Name
                    </label>
                </Col>
                <Col flex="1">
                    <Input
                        id="searchName"
                        placeholder="Enter employee name"
                        size="middle"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        onPressEnter={onFilter}
                    />
                </Col>
                <Col flex="180px">
                    <Input
                        placeholder="V30001"
                        size="middle"
                        value={searchCode}
                        onChange={(e) => setSearchCode(e.target.value)}
                        onPressEnter={onFilter}
                    />
                </Col>
                <Col flex="120px">
                    <Button onClick={onFilter}
                        style={{ width: "100%" }}
                    >
                        <img src={binoculars} alt="files icon" style={{ width: 16, height: 16 }} />
                        Filter
                    </Button>
                </Col>
                <Col flex="110px">
                    <Button
                        icon={<CheckOutlined />}
                        onClick={onSelect}
                        style={{ width: "100%" }}
                    >
                        Select
                    </Button>
                </Col>
                <Col flex="110px">
                    <Button
                        type="default"
                        icon={<CloseOutlined />}
                        onClick={onCancel}
                        style={{ width: "100%" }}
                    >
                        Cancel
                    </Button>
                </Col>
            </Row>

            <Table
                bordered
                columns={columns}
                dataSource={filteredData}
                size="small"
                pagination={false}
                rowSelection={rowSelection}
                scroll={{ x: 'max-content', y: 'calc(100vh - 160px)' }}
                style={{
                    backgroundColor: "white",
                    border: "1px solid #d9d9d9",
                    userSelect: "none",
                    height: 500,
                }}
                rowClassName={(record, index) =>
                    selectedRowKeys[0] === record.key ? "ant-table-row-selected" : ""
                }
            />
        </div>
    );
};

export default SalaryEditControlPanel;

