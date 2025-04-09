import loading from '../../assets/infinite-spinner.svg'
const Loading = () => {
  return (
    <div className='flex justify-center items-center h-screen'>
        <img className='w-25 h-25' src={loading} alt="Loading..." />
    </div>
  )
}

export default Loading
