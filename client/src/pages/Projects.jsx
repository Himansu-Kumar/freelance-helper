import React, { useState, useEffect } from 'react';
import { Plus, Briefcase, Search, Filter } from 'lucide-react';
import api from '../utils/api';
import ProjectModal from '../components/ProjectModal';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const openAddModal = () => {
    setEditProject(null);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data);
    } catch (error) {
      console.error('Error fetching projects', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'border-black font-black text-black';
      case 'Completed': return 'bg-black text-white';
      case 'On Hold': return 'border-black border-dashed text-black';
      case 'Cancelled': return 'line-through text-black';
      default: return 'border-black text-black';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-black pb-4">
        <div>
          <h1 className="text-3xl font-black text-black uppercase tracking-tighter">Projects</h1>
          <p className="text-sm text-black font-bold uppercase tracking-widest">Active Engagements</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 bg-black text-white px-6 py-2 border-2 border-black hover:bg-white hover:text-black transition-colors text-sm font-black uppercase">
          <Plus className="h-4 w-4" strokeWidth={3} />
          New Project
        </button>
      </div>

      <div className="bg-white border-2 border-black p-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-black" strokeWidth={2} />
            </div>
            <input
              type="text"
              placeholder="SEARCH FILES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border-2 border-black bg-white text-black placeholder-black/30 outline-none font-bold uppercase text-sm"
            />
          </div>
          <button className="flex items-center gap-2 bg-white border-2 border-black text-black px-4 py-2 hover:bg-black hover:text-white transition-colors text-xs font-black uppercase">
            <Filter className="h-4 w-4" strokeWidth={2} />
            Filter
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-black font-black uppercase tracking-widest">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 px-4 border border-black border-dashed">
            <Briefcase className="mx-auto h-12 w-12 text-black" strokeWidth={1} />
            <h3 className="mt-4 text-sm font-black text-black uppercase">Project log empty</h3>
            <div className="mt-6">
              <button onClick={openAddModal} className="flex items-center gap-2 mx-auto bg-black text-white px-6 py-2 border-2 border-black hover:bg-white hover:text-black transition-colors text-sm font-black uppercase">
                <Plus className="h-4 w-4" strokeWidth={3} />
                New Project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.client?.name && p.client.name.toLowerCase().includes(searchQuery.toLowerCase()))).map((project) => (
              <div 
                key={project._id} 
                onClick={() => { setEditProject(project); setIsModalOpen(true); }}
                className="border-2 border-black p-6 hover:bg-black hover:text-white transition-all group cursor-pointer bg-white"
              >
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-black uppercase tracking-tighter">{project.name}</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-black uppercase border-2 ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-xs font-bold uppercase opacity-60 mb-8 line-clamp-3 tracking-widest">
                  {project.description || 'LOG_ENTRY_NULL'}
                </p>
                <div className="flex justify-between items-end border-t-2 border-black group-hover:border-white pt-4">
                  <div className="text-[10px] font-black uppercase tracking-widest">
                    {project.client?.name || 'UNKNOWN_CLIENT'}
                  </div>
                  {project.budget && (
                    <div className="text-lg font-black tracking-tighter">
                      ${project.budget.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProjectModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditProject(null); }} 
        refreshData={fetchProjects} 
        editData={editProject}
      />
    </div>
  );
};

export default Projects;
