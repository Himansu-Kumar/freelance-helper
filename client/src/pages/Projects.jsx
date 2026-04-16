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
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500">Track and manage your ongoing work.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium">
          <Plus className="h-4 w-4" />
          Add Project
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Briefcase className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
            <div className="mt-6">
              <button onClick={openAddModal} className="flex items-center gap-2 mx-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium">
                <Plus className="h-4 w-4" />
                Add Project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.client?.name && p.client.name.toLowerCase().includes(searchQuery.toLowerCase()))).map((project) => (
              <div 
                key={project._id} 
                onClick={() => { setEditProject(project); setIsModalOpen(true); }}
                className="border border-gray-200 rounded-lg p-5 hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer bg-white"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{project.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {project.description || 'No description provided.'}
                </p>
                <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-4">
                  <div className="text-gray-600">
                    <span className="font-medium">{project.client?.name || 'Unknown Client'}</span>
                  </div>
                  {project.budget && (
                    <div className="font-semibold text-gray-900">
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
