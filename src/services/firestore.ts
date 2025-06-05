import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  arrayUnion,
  arrayRemove,
  deleteField,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { User } from '../types';

export interface FirestoreUser {
  email: string;
  uid: string;
  logobase64: string;
  equipments: Array<{
    id: string;
    description: string;
    category: string;
    value: number;
  }>;
  expenses: Array<{
    id: string;
    description: string;
    category: string;
    value: number;
  }>;
  jobs: Array<{
    id: string;
    assistance: string;
    category: string;
    client: string;
    date: string;
    descriptions: string;
    difficulty: string;
    equipment: string;
    eventDate: string;
    hours: number;
    logistics: string;
    profit: number;
    status: string;
    value: number;
  }>;
  routine: {
    dailyHours: number;
    dalilyValue: number;
    desiredSalary: number;
    workDays: number;
  };
}

export interface FirestoreTask {
  name: string;
  description: string;
  date: string;
  status: string;
  ownerUID: string;
}

export interface FirestoreAgency extends FirestoreUser {
  colaboradores: Array<{
    uid: string;
    email: string;
    name?: string;
  }>;
  ownerUID: string;
}

class FirestoreService {
  // User operations - usando coleção 'usuarios' com uid
  async getUserData(uid: string): Promise<FirestoreUser | null> {
    try {
      console.log('🔍 Buscando dados do usuário na coleção usuarios:', uid);
      const userDoc = await getDoc(doc(db, 'usuarios', uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as FirestoreUser;
        console.log('✅ Dados do usuário encontrados:', {
          equipments: data.equipments?.length || 0,
          expenses: data.expenses?.length || 0,
          jobs: data.jobs?.length || 0,
          routine: data.routine
        });
        return data;
      }
      console.log('❌ Usuário não encontrado na coleção usuarios');
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar dados do usuário:', error);
      throw error;
    }
  }

  async createUser(userData: FirestoreUser): Promise<void> {
    try {
      console.log('📝 Criando usuário na coleção usuarios:', userData.uid);
      await setDoc(doc(db, 'usuarios', userData.uid), userData);
      console.log('✅ Usuário criado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      throw error;
    }
  }

  async updateUserField(uid: string, field: string, value: any): Promise<void> {
    try {
      await updateDoc(doc(db, 'usuarios', uid), {
        [field]: value
      });
      console.log('✅ Campo atualizado:', field);
    } catch (error) {
      console.error('❌ Erro ao atualizar campo do usuário:', error);
      throw error;
    }
  }

  // Equipment operations
  async addEquipment(uid: string, equipment: any): Promise<void> {
    try {
      console.log('📦 Adicionando equipamento para uid:', uid);
      await updateDoc(doc(db, 'usuarios', uid), {
        equipments: arrayUnion(equipment)
      });
      console.log('✅ Equipamento adicionado');
    } catch (error) {
      console.error('❌ Erro ao adicionar equipamento:', error);
      throw error;
    }
  }

  async removeEquipment(uid: string, equipment: any): Promise<void> {
    try {
      console.log('🗑️ Removendo equipamento para uid:', uid);
      await updateDoc(doc(db, 'usuarios', uid), {
        equipments: arrayRemove(equipment)
      });
      console.log('✅ Equipamento removido');
    } catch (error) {
      console.error('❌ Erro ao remover equipamento:', error);
      throw error;
    }
  }

  async updateEquipments(uid: string, equipments: any[]): Promise<void> {
    try {
      console.log('🔄 Atualizando lista de equipamentos para uid:', uid);
      await updateDoc(doc(db, 'usuarios', uid), {
        equipments: equipments
      });
      console.log('✅ Lista de equipamentos atualizada');
    } catch (error) {
      console.error('❌ Erro ao atualizar equipamentos:', error);
      throw error;
    }
  }

  // Expenses operations
  async addExpense(uid: string, expense: any): Promise<void> {
    try {
      console.log('💰 Adicionando despesa para uid:', uid);
      await updateDoc(doc(db, 'usuarios', uid), {
        expenses: arrayUnion(expense)
      });
      console.log('✅ Despesa adicionada');
    } catch (error) {
      console.error('❌ Erro ao adicionar despesa:', error);
      throw error;
    }
  }

  async removeExpense(uid: string, expense: any): Promise<void> {
    try {
      console.log('🗑️ Removendo despesa para uid:', uid);
      await updateDoc(doc(db, 'usuarios', uid), {
        expenses: arrayRemove(expense)
      });
      console.log('✅ Despesa removida');
    } catch (error) {
      console.error('❌ Erro ao remover despesa:', error);
      throw error;
    }
  }

  async updateExpenses(uid: string, expenses: any[]): Promise<void> {
    try {
      console.log('🔄 Atualizando lista de despesas para uid:', uid);
      await updateDoc(doc(db, 'usuarios', uid), {
        expenses: expenses
      });
      console.log('✅ Lista de despesas atualizada');
    } catch (error) {
      console.error('❌ Erro ao atualizar despesas:', error);
      throw error;
    }
  }

  // Jobs operations - CORRIGIDO para usar IDs únicos
  async addJob(uid: string, job: any): Promise<void> {
    try {
      console.log('💼 Adicionando job para uid:', uid);
      const currentData = await this.getUserData(uid);
      const jobs = currentData?.jobs || [];
      
      const newJob = {
        ...job,
        id: job.id || crypto.randomUUID() // Garantir que tem ID
      };
      
      jobs.push(newJob);
      
      await updateDoc(doc(db, 'usuarios', uid), {
        jobs: jobs
      });
      console.log('✅ Job adicionado com ID:', newJob.id);
    } catch (error) {
      console.error('❌ Erro ao adicionar job:', error);
      throw error;
    }
  }

  async updateJob(uid: string, jobId: string, updatedJob: any): Promise<void> {
    try {
      console.log('🔄 Atualizando job:', jobId);
      const currentData = await this.getUserData(uid);
      if (!currentData || !currentData.jobs) return;
      
      const jobs = currentData.jobs.map(job => 
        job.id === jobId ? { ...job, ...updatedJob, id: jobId } : job
      );
      
      await updateDoc(doc(db, 'usuarios', uid), {
        jobs: jobs
      });
      console.log('✅ Job atualizado no Firebase');
    } catch (error) {
      console.error('❌ Erro ao atualizar job:', error);
      throw error;
    }
  }

  async removeJob(uid: string, jobId: string): Promise<void> {
    try {
      console.log('🗑️ Removendo job:', jobId);
      const currentData = await this.getUserData(uid);
      if (!currentData || !currentData.jobs) return;
      
      const jobs = currentData.jobs.filter(job => job.id !== jobId);
      
      await updateDoc(doc(db, 'usuarios', uid), {
        jobs: jobs
      });
      console.log('✅ Job removido do Firebase');
    } catch (error) {
      console.error('❌ Erro ao remover job:', error);
      throw error;
    }
  }

  async updateJobs(uid: string, jobs: any[]): Promise<void> {
    try {
      console.log('🔄 Atualizando lista completa de jobs:', uid);
      await updateDoc(doc(db, 'usuarios', uid), {
        jobs: jobs
      });
      console.log('✅ Lista de jobs atualizada');
    } catch (error) {
      console.error('❌ Erro ao atualizar jobs:', error);
      throw error;
    }
  }

  // Routine operations
  async updateRoutine(uid: string, routine: any): Promise<void> {
    try {
      console.log('⏰ Atualizando rotina para uid:', uid);
      await updateDoc(doc(db, 'usuarios', uid), {
        routine: routine
      });
      console.log('✅ Rotina atualizada');
    } catch (error) {
      console.error('❌ Erro ao atualizar rotina:', error);
      throw error;
    }
  }

  // Tasks operations - usando coleção 'tasks' separada
  async getUserTasks(userId: string): Promise<FirestoreTask[]> {
    try {
      console.log('📋 Buscando tasks para ownerUID:', userId);
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('ownerUID', '==', userId)
      );
      const querySnapshot = await getDocs(tasksQuery);
      const tasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FirestoreTask & { id: string }));
      console.log('✅ Tasks encontradas:', tasks.length);
      return tasks;
    } catch (error) {
      console.error('❌ Erro ao buscar tasks:', error);
      return [];
    }
  }

  async addTask(taskData: FirestoreTask): Promise<string> {
    try {
      console.log('📝 Adicionando task com ownerUID:', taskData.ownerUID);
      const docRef = await addDoc(collection(db, 'tasks'), taskData);
      console.log('✅ Task adicionada com ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao adicionar task:', error);
      throw error;
    }
  }

  async updateTask(taskId: string, taskData: Partial<FirestoreTask>): Promise<void> {
    try {
      console.log('📝 Atualizando task:', taskId, taskData);
      await updateDoc(doc(db, 'tasks', taskId), taskData);
      console.log('✅ Task atualizada no Firestore');
    } catch (error) {
      console.error('❌ Erro ao atualizar task:', error);
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      console.log('🗑️ Deletando task completamente:', taskId);
      await deleteDoc(doc(db, 'tasks', taskId));
      console.log('✅ Task deletada do Firestore');
    } catch (error) {
      console.error('❌ Erro ao deletar task:', error);
      throw error;
    }
  }

  // Agency operations
  async getUserAgency(uid: string): Promise<(FirestoreAgency & { id: string }) | null> {
    try {
      console.log('🏢 Buscando agência para uid:', uid);
      
      // Primeiro verificar se é colaborador
      const agenciesQuery = query(
        collection(db, 'agencias'),
        where('colaboradores', 'array-contains', { uid: uid })
      );
      const querySnapshot = await getDocs(agenciesQuery);
      
      if (!querySnapshot.empty) {
        const agencyDoc = querySnapshot.docs[0];
        const agencyData = {
          id: agencyDoc.id,
          ...agencyDoc.data()
        } as FirestoreAgency & { id: string };
        console.log('✅ Agência encontrada como colaborador:', agencyData.id);
        return agencyData;
      }
      
      // Se não encontrar como colaborador, verificar se é owner
      const ownerQuery = query(
        collection(db, 'agencias'),
        where('ownerUID', '==', uid)
      );
      const ownerSnapshot = await getDocs(ownerQuery);
      
      if (!ownerSnapshot.empty) {
        const agencyDoc = ownerSnapshot.docs[0];
        const agencyData = {
          id: agencyDoc.id,
          ...agencyDoc.data()
        } as FirestoreAgency & { id: string };
        console.log('✅ Agência encontrada como owner:', agencyData.id);
        return agencyData;
      }
      
      console.log('❌ Usuário não pertence a nenhuma agência');
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar agência:', error);
      return null;
    }
  }

  async getAgencyData(agencyId: string): Promise<FirestoreAgency | null> {
    try {
      const agencyDoc = await getDoc(doc(db, 'agencias', agencyId));
      if (agencyDoc.exists()) {
        return agencyDoc.data() as FirestoreAgency;
      }
      return null;
    } catch (error) {
      console.error('Error getting agency data:', error);
      throw error;
    }
  }

  // Métodos específicos para agências
  async addAgencyEquipment(agencyId: string, equipment: any): Promise<void> {
    try {
      console.log('📦 Adicionando equipamento para agência:', agencyId);
      await updateDoc(doc(db, 'agencias', agencyId), {
        equipments: arrayUnion(equipment)
      });
      console.log('✅ Equipamento adicionado à agência');
    } catch (error) {
      console.error('❌ Erro ao adicionar equipamento à agência:', error);
      throw error;
    }
  }

  async removeAgencyEquipment(agencyId: string, equipment: any): Promise<void> {
    try {
      console.log('🗑️ Removendo equipamento da agência:', agencyId);
      await updateDoc(doc(db, 'agencias', agencyId), {
        equipments: arrayRemove(equipment)
      });
      console.log('✅ Equipamento removido da agência');
    } catch (error) {
      console.error('❌ Erro ao remover equipamento da agência:', error);
      throw error;
    }
  }

  async addAgencyExpense(agencyId: string, expense: any): Promise<void> {
    try {
      console.log('💰 Adicionando despesa para agência:', agencyId);
      await updateDoc(doc(db, 'agencias', agencyId), {
        expenses: arrayUnion(expense)
      });
      console.log('✅ Despesa adicionada à agência');
    } catch (error) {
      console.error('❌ Erro ao adicionar despesa à agência:', error);
      throw error;
    }
  }

  async removeAgencyExpense(agencyId: string, expense: any): Promise<void> {
    try {
      console.log('🗑️ Removendo despesa da agência:', agencyId);
      await updateDoc(doc(db, 'agencias', agencyId), {
        expenses: arrayRemove(expense)
      });
      console.log('✅ Despesa removida da agência');
    } catch (error) {
      console.error('❌ Erro ao remover despesa da agência:', error);
      throw error;
    }
  }

  // Métodos específicos para jobs de agências
  async addAgencyJob(agencyId: string, job: any): Promise<void> {
    try {
      console.log('💼 Adicionando job para agência:', agencyId);
      await updateDoc(doc(db, 'agencias', agencyId), {
        jobs: arrayUnion(job)
      });
      console.log('✅ Job adicionado à agência');
    } catch (error) {
      console.error('❌ Erro ao adicionar job à agência:', error);
      throw error;
    }
  }

  async removeAgencyJob(agencyId: string, job: any): Promise<void> {
    try {
      console.log('🗑️ Removendo job da agência:', agencyId);
      await updateDoc(doc(db, 'agencias', agencyId), {
        jobs: arrayRemove(job)
      });
      console.log('✅ Job removido da agência');
    } catch (error) {
      console.error('❌ Erro ao remover job da agência:', error);
      throw error;
    }
  }

  async updateAgencyJobs(agencyId: string, jobs: any[]): Promise<void> {
    try {
      console.log('🔄 Atualizando lista de jobs da agência:', agencyId);
      await updateDoc(doc(db, 'agencias', agencyId), {
        jobs: jobs
      });
      console.log('✅ Lista de jobs da agência atualizada');
    } catch (error) {
      console.error('❌ Erro ao atualizar jobs da agência:', error);
      throw error;
    }
  }

  // Método para importar dados JSON
  async importUserData(uid: string, jsonData: any): Promise<void> {
    try {
      console.log('📥 Importando dados JSON para uid:', uid);
      
      const updateData: any = {};
      
      if (jsonData.equipments) {
        updateData.equipments = jsonData.equipments;
      }
      
      if (jsonData.expenses) {
        updateData.expenses = jsonData.expenses;
      }
      
      if (jsonData.routine) {
        updateData.routine = jsonData.routine;
      }
      
      if (jsonData.jobs) {
        updateData.jobs = jsonData.jobs;
      }
      
      await updateDoc(doc(db, 'usuarios', uid), updateData);
      console.log('✅ Dados JSON importados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao importar dados JSON:', error);
      throw error;
    }
  }
}

export const firestoreService = new FirestoreService();
