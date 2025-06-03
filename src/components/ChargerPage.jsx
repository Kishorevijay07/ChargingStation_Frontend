import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import { useAuth } from '../context/AuthContext'


const ChargerPage = () => {
  const authUser = useAuth();

  console.log('ChargerPage authUser:', authUser);
  return (
    <div className="flex h-screen">
      <div className="w-1/2 border-r border-gray-300">
        {authUser && <LeftSidebar authUser={authUser} />}
      </div>
      <div className="w-1/2">
        {authUser && <RightSidebar/>}
      </div>
    </div>
  );
};

export default ChargerPage;
