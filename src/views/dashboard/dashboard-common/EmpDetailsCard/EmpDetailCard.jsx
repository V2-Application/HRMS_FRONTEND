import { EditOutlined } from '@ant-design/icons'
import styles from './EmpDetailCard.module.css'

const EmpDetailCard = ({
  name = 'Rohit Khatri',
  designation = 'Frontend Developer',
  phone = '9315738305',
  email = 'khatrirohit2002@gmail.com',
  reportHead = 'Nikhil Chhokra',
  joinedOn = '20 Aug 2024',
}) => {
  return (
    <div className={`${styles.card}`}>
      <div className={`${styles.sub_card_1}`}>
        <span className={`${styles.edit_icon} ${styles.flex_center}`}>
          <EditOutlined />
        </span>
        <span>{name}</span>

        <span>
          <span className={`${styles.indicate}`}></span>
          {designation}
        </span>
      </div>

      <div className={`${styles.sub_card_2}`}>
        <div className={`${styles.sub_card_2_item}`}>
          <span>Phone</span>
          <span>{phone}</span>
        </div>
        <div className={`${styles.sub_card_2_item}`}>
          <span>Email</span>
          <span>{email}</span>
        </div>
        <div className={`${styles.sub_card_2_item}`}>
          <span>Report Head</span>
          <span>{reportHead}</span>
        </div>
        <div className={`${styles.sub_card_2_item}`}>
          <span>Joined On</span>
          <span>{joinedOn}</span>
        </div>
      </div>
    </div>
  )
}

export default EmpDetailCard
