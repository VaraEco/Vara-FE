import Cookies from "universal-cookie";
import { mainConfig } from "./appConfig";
import { supabase, updateSupabaseClient } from '../../supabaseClient';
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
// import { uploadToS3 } from "./s3Config";

export const generalFunction = {
    getUserId: () => {
        let userId = localStorage.getItem("questUserId");
        return userId;
    },

    getUserToken: () => {
        let token = localStorage.getItem("questUserToken");
        return token;
    },

    showLoader: () => {
        let loader = document.querySelector("#loader");
        loader.style.display = "flex";
    },

    hideLoader: () => {
        let loader = document.querySelector("#loader");
        loader.style.display = "none";
    },

    getUserCredentials: () => {
        let questUserCredentials = JSON.parse(localStorage.getItem("questUserCredentials"));
        return questUserCredentials;
    },

    logout: () => {
        let cookies = new Cookies();
        cookies.remove("questUserId");
        cookies.remove("questUserToken");
        cookies.remove("questUserCredentials");
        cookies.remove("auth-token", { path: '/' });
        localStorage.removeItem("questUserId");
        localStorage.removeItem("questUserToken");
        localStorage.removeItem("questUserCredentials");
        localStorage.removeItem("adminDetails");
        localStorage.removeItem("varaCompanyId");
        localStorage.removeItem("varaUserId");
        localStorage.removeItem("messages");
        localStorage.removeItem("toastShown")
        localStorage.removeItem("allNotification")
        updateSupabaseClient(null);
    },

    createUrl: (apiString) => {
        const url = `${mainConfig.QUEST_BASE_URL}${apiString}`;
        console.log(url);
        
        const headers = {
            apiKey: mainConfig.QUEST_API_KEY,
            userId: generalFunction.getUserId(),
            token: generalFunction.getUserToken()
        };
    
        console.log(headers);
        return {
            url,
            headers,
        };
    },

    getCompanyId: async () => {
        let company_id = localStorage.getItem("varaCompanyId");        
        if (!company_id) {
            await generalFunction.setCompanyId();
            company_id = localStorage.getItem("varaCompanyId");
        }
        return company_id;
    },

    setCompanyId: async () => {
        let AdminDetails = await JSON.parse(localStorage.getItem("adminDetails"));
        if (!AdminDetails) {
            throw new Error("No admin details found in localStorage");
        }
        const companyInfo = await generalFunction.getCompanyVaraID(AdminDetails.ownerEntityId);
        if (companyInfo && companyInfo.length > 0) {
            localStorage.setItem('varaCompanyId', companyInfo[0]['id']);
        } else {
            throw new Error("No company information found");
        }
    },

    createDefaultRoles: async (entityId, apiKey) => {
        let request = generalFunction.createUrl(`api/entities/${entityId}/roles?userId=${generalFunction.getUserId()}`);
        let responses = await Promise.all(["OWNER", "ADMIN", "TEAM MANAGER", "FIELD MANAGER"].map((role) => {
            axios.post(request.url, {role}, { headers: {...request.headers, apiKey: apiKey} })
        }));
    },

    count: 0,

    uploadImageToBackend: async (file) => {
        if (!file) {
            return null;
        }
        if (file.size > 1000000 && generalFunction.count <= 50) {
            try {
                // Resize the image to below 1MB
                const compressedImage = await imageCompression(file, {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1024,
                    useWebWorker: true,
                    initialQuality: 1 - (generalFunction.count * 0.05),
                });
                generalFunction.count++

                // Call the uploadImageToBackend function recursively with the compressed image
                return await generalFunction.uploadImageToBackend(compressedImage);
            } catch (error) {
                return null;
            }
        }

        const { url, headers: baseHeaders } = generalFunction.createUrl(`api/upload-img`);
        const headers = {
            ...baseHeaders,
            "Content-Type": "form-data",
        };

        const formData = new FormData();
        formData.append("uploaded_file", file);

        try {
            const res = await axios.post(url, formData, { headers });
            return res;
        } catch (error) {
            return null;
        }
    },

    fetchCommunities: async (userId) => {
        let request = generalFunction.createUrl(`api/users/${userId}/admin-entities`);
        try {
            const response = await axios.get(request.url, { headers: { ...request.headers, apikey: mainConfig.API_KEY } });
            if (response.data.success === false) {
                return response.data
            }

            if (response.data.success === true) {
                if (response.data.data.length == 0) {
                    return response.data;
                }
                let comm = response?.data?.data.filter((ele) => ele.parentEntityId == undefined)
                return { success: true, data: comm };
            }
        } catch (error) {
            return { success: false, loginAgain: true };
        }
    },

    supabase_getUser: async (email) => {
        const { data, error } = await supabase
            .from('users')
            .select()
            .eq('email', email);
        if (error) {
            throw error;
        }
        return data;
    },

    supabase_addData: async (table, rowData) => {
        const { data, error } = await supabase.from(table).select('*').eq("email", rowData.email).maybeSingle();
        if (error) {
            throw error;
        }
        
        if (!data || !data?.email) {
            const { data: newUserData, error: insertError } = await supabase
              .from(table)
              .insert([{
                email: rowData.email,
                ...(!!rowData?.name && { name: rowData?.name }),
              }])
              .select();
            if (insertError) {
              throw insertError;
            }
            return newUserData;
        }
    },

    supabase_updateData: async (table, email, rowData) => {
        const { data, error } = await supabase
        .from(table)
        .update(rowData)
        .eq("email", email)
        .select()

        if (error) {
            throw error;
        }
    },

    getTableData: async (table) => {
        try {
            const companyId = await generalFunction.getCompanyId();

            if (!companyId) {
                throw new Error("Failed to retrieve company ID");
            }

            const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq('company_id', companyId);

            if (error) {
                throw error;
            }
            return data;
        } catch (error) {
            console.error("Failed to get table data:", error);
            throw error;
        }
    },

    getTaskData: async (table, project_id) => {
        try {
            const companyId = await generalFunction.getCompanyId();

            if (!companyId) {
                throw new Error("Failed to retrieve company ID");
            }

            const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq('company_id', companyId)
                .eq('project_id', project_id)

            if (error) {
                throw error;
            }
            return data;
        } catch (error) {
            console.error("Failed to get table data:", error);
            throw error;
        }
    },

    getTableRow: async (table, row_name, row_id) => {
        const company_id = await generalFunction.getCompanyId()
        const { data } = await supabase
          .from(table)
          .select('*')
          .eq([row_name], row_id)
          .eq('company_id', company_id)
        return data;
    },

    // Function to get Vara's company id from Quest_id
    getCompanyVaraID: async (quest_company_id) => {

        try {            
            const { data, error } = await supabase
              .from('company')
              .select('id')
              .eq('company_id', quest_company_id);
            if (error) {
                throw error;
            }            
            return data;
        } catch (error) {
            console.error("Error fetching table row:", error);
            return null;
        }
    },

    updateRow: async(table, update_column, update_data, key_column, key_data) => {
        const company_id = await generalFunction.getCompanyId()
        const { error } = await supabase
        .from(table)
        .update({[update_column]: update_data})
        .eq(key_column, key_data)
        .eq('company_id', company_id)

        if (error) {
            throw error;
        }
    },

    createTableRow: async (table, newRowData) => {
        const { data, error } = await supabase
              .from(table)
              .insert(newRowData)
        if (error) {
            throw error;
        }
    },

    removeTableRow: async (table, newRowData) => {
        const { data, error } = await supabase
              .from(table)
              .delete()
              .match(newRowData)
        if (error) {
            throw error;
        }
    },

    updateUserAccessData: async (userId, updatedData) => {
        try {
          const { data, error } = await supabase
            .from('user_data_access') // Your Supabase table name
            .update(updatedData)
            .eq('id', userId) // Ensure you update the correct row
            .single(); // Assuming you want to return a single updated row
      
          if (error) throw error;
      
          return data; // Return the updated data if needed
        } catch (error) {
          console.error('Error updating user access data:', error);
          throw error; // Re-throw the error for handling elsewhere
        }
      },

    editProject: async (rowData) => {
        const company_id = await generalFunction.getCompanyId()
        const {data, error} = await supabase
            .from('project_management')
            .update({
                project: rowData.project,
                status: rowData.status,
                due_date: rowData.due_date,
                lead: rowData.lead,
                reminder: rowData.reminder
            })
            .eq('project_id', rowData.project_id)
            .eq('company_id', company_id);

        if (error) {
            throw error;
        }
    },

    deleteProject: async(rowData)=> {
        const company_id = await generalFunction.getCompanyId()
        
        const {data, error} = await supabase
        .from('project_management')
        .delete()
        .eq('id', rowData.id)
        .eq('company_id', company_id)

        if(error){
            throw error
        }
        
    },

    editTask: async (rowData) => {
        const company_id = await generalFunction.getCompanyId()
        const {data, error} = await supabase
            .from('task_management')
            .update({
                task: rowData.task,
                status: rowData.status,
                due_date: rowData.due_date,
                lead: rowData.lead,
                description: rowData.description,
                reminder: rowData.reminder
            })
            .eq('project_id', rowData.project_id)
            .eq('company_id', company_id)
            .eq('task_id', rowData.task_id);

        if (error) {
            throw error;
        }
    },

    deleteTask: async (rowData)=> {

        const company_id = await generalFunction.getCompanyId()
        const {data, error} = await supabase
        .from('task_management')
        .delete()
        .eq('id', rowData.id)
        .eq('company_id', company_id)
        
        if(error){
            throw error
        }
    },

    deleteAllTasks: async (rowData)=> {

        const company_id = await generalFunction.getCompanyId()
        const {data, error} = await supabase
        .from('task_management')
        .delete()
        .eq('project_id', rowData.project_id)
        .eq('company_id', company_id)

        if(error){
            throw error
        }
    },

    fetchCompliances: async () => {
        const { data } = await supabase
          .from(`compliance`)
          .select('*')
        return data;
    },
    
    createCompliance: async (newRowData) => {
        const { data, error } = await supabase
              .from(`compliance`)
              .insert({ certification: newRowData.certification, status: newRowData.status , due_date: newRowData.due_date , task_assigned: newRowData.task_assigned , checklist: newRowData.checklist })
        
        if (error) {
            throw error;
        }
    },

    fetchUserPermissions: async() => {
        const companyid = await generalFunction.getCompanyId();
        const { data, error } = await supabase
            .rpc('fetch_user_permissions', { p_company_id: companyid });
        if (error) {
            throw error;
        }
        return data;
    },
    
    fetchAllUsers: async () => {
        const companyid = await generalFunction.getCompanyId();
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('varacompanyid', parseInt(companyid,10));
            
        if (error) {
            throw error;
        }
        return data;
    },

    fetchFacilities: async () => {
        const companyid = await generalFunction.getCompanyId();
        const { data, error } = await supabase
            .from('facility',)
            .select('facility_id, facility_name, company_id')
            .eq('company_id', companyid);
        if (error) {
            throw error;
        }
        return data;
    },

    fetchProcesses: async (facilityId) => {
        const { data, error } = await supabase
            .from('process')
            .select('process_id, process_name')
            .eq('facility_id', facilityId);
        if (error) {
            throw error;
        }
        return data;
    },

    fetchParameters: async () => {
        const companyId = await generalFunction.getCompanyId();
        const { data, error } = await supabase
            .from('parameter')
            .select(`para_id, para_name,users!inner(varacompanyid)`)
            .eq('users.varacompanyid', companyId);;
        if (error) {
            throw error;
        }
        return data;
    },

    fetchUserAccessData: async (userId) => {
        const { data, error } = await supabase
            .rpc('fetch_user_access_data', { p_user_id: userId });
        if (error) {
            throw error;
        }
        return data;
    },

    fetchUserPermissionRole: async (userID) => {
        const { data, error } = await supabase
            .from('user_permissions')
            .select('*')
            .eq('user_id', userID);;
        if (error) {
            throw error;
        }
        return data;

    },

    // Add user permission
    createUserPermission: async (UserPermission) => {
        const { data, error } = await supabase
            .from('user_permissions')
            .insert([UserPermission])
            .select('*');
        if (error) {
            throw error;
        }
        return data;
    },

    // Update User permission
    updateUserPermission: async (userId, userDetails) => {
        try {
            const { data, error } = await supabase
                .from('user_permissions')
                .update({
                    role: userDetails.role,
                    status: userDetails.status,
                    access_till: userDetails.access_till
                })
                .eq('id', userId);

            if (error) {
                throw error;
            }

            return data;
        } catch (error) {
            console.error("Error updating user permissions:", error);
            throw error;
        }
    },

    getUserRole: async(userId) => {
        const { data, error } = await supabase
            .from('user_permissions')
            .select('role')
            .eq('user_id', userId);
        if (error) {
            throw error;
        }
        return data;
    },
    

    // Function to deactivate user
    deactivateUser: async (UserID) => {
        const { data, error } = await supabase
            .from('users')
            .update({is_active: false})
            .eq('id', UserID);
        if (error) {
            throw error;
        }
        return data;
    },

    // Function to get user ID from the email
    getUserIdFromEmail: async (user_email) => {
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('email', user_email);
        if (error) {
            throw error;
        }
        return data;
    },

    fetchSuppliers: async () => {
        const company_id = await generalFunction.getCompanyId();
        const { data } = await supabase
          .from(`supplier_management`)
          .select('*')
          .eq('company_id', company_id)
        return data; 
    },

    createSupplier: async (newRowData) => {
        const company_id = await generalFunction.getCompanyId();
        const { data, error } = await supabase
            .from(`supplier_management`)
            .insert({
                supplier_name: newRowData.supplier_name,
                location: newRowData.location,
                key_product: newRowData.key_product,
                sustainability_score: newRowData.sustainability_score,
                key_contact: newRowData.key_contact,
                key_email: newRowData.key_email,
                company_id: company_id,
                country: newRowData.country,
                state: newRowData.state,
                city: newRowData.city
            })
            .select();
    
        if (error) {
            throw error; 
        }

        return data[0].id;
    },
    

    fetchSupplierAnalytics: async (supplier) => {
        const company_id = await generalFunction.getCompanyId();
        const { data } = await supabase
            .from(`supplier_management`)
            .select('*')
            .eq('company_id', company_id)
            .eq('supplier_name', supplier)
        return data;
    },

    fetchSupplierProducts: async (supplierData) => {
        const { data } = await supabase
            .from(`supplier_products`)
            .select('*')
            .eq('supplier_id', supplierData.id)
        return data;
    },

    fetchSupplierCertificates: async (supplierData) => {
        const { data } = await supabase
            .from(`supplier_certificates`)
            .select('*')
            .eq('supplier_id', supplierData.id)
        return data;
    },

    fetchSupplierEmails: async (supplierData) => {
        const { data } = await supabase
            .from(`supplier_emails`)
            .select('*')
            .eq('supplier_id', supplierData.id)
        return data;
    },

    createSupplierCertificate: async (newCert, supplierData) => {
        const {data, error} = await supabase
            .from(`supplier_certificates`)
            .insert({ 
                certificate_name: newCert.certificate_name,
                status: newCert.status , expiration: newCert.expiration,
                last_audited: newCert.last_audited,
                link: newCert.link , notes: newCert.notes,
                supplier_id: supplierData.id,
            })
            .select();

        if (error) {
            throw error;
        }

        return data[0].id;
    },

    editSupplierCertificate: async (certRowData) => {
        const {data, error} = await supabase
            .from('supplier_certificates')
            .update({
                certificate_name: certRowData.certificate_name,
                status: certRowData.status,
                expiration: certRowData.expiration,
                last_audited: certRowData.last_audited,
                link: certRowData.link,
                notes: certRowData.notes,
            })
            .eq('id', certRowData.id);
        
        if (error) {
            throw error;
        }
    },

    createSupplierProduct: async (newProd, supplierData) => {
        const { data, error } = await supabase
            .from('supplier_products')
            .insert({ 
                product_name: newProd.product_name, 
                serial_number: newProd.serial_number, 
                last_exported: newProd.last_exported, 
                volume: newProd.volume,
                supplier_id: supplierData.id,
            })
            .select();

        if (error) {
            throw error;
        }

        return data[0].id;
    },

    editSupplierProduct: async (prodRowData) => {
        const {data, error} = await supabase
            .from('supplier_products')
            .update({
                product_name: prodRowData.product_name,
                serial_number: prodRowData.serial_number,
                last_exported: prodRowData.last_exported,
                volume: prodRowData.volume
            })
            .eq('id', prodRowData.id);
        
        if (error) {
            throw error;
        }
    },

    editSupplier: async (rowData) => {
        const {data, error} = await supabase
            .from('supplier_management')
            .update({
                supplier_name: rowData.supplier_name,
                location: rowData.location,
                key_product: rowData.key_product,
                sustainability_score: rowData.sustainability_score,
                key_contact: rowData.key_contact,
                key_email: rowData.key_email,
                country: rowData.country,
                state: rowData.state,
                city: rowData.city
            })
            .eq('id', rowData.id);
        
        if (error) {
            throw error;
        }
    },

    editDataPoint: async (rowData) => {
        let evidenceUrl = '';
        let file_name = '';
        if (rowData.evidenceFile) {
            evidenceUrl = await generalFunction.uploadFile(rowData.evidenceFile);
            file_name = `${Date.now()}_${rowData.evidenceFile.name}`;
        }
        const {data, error} = await supabase
            .from('parameter_log')
            .update({
                value: rowData.value,
                log_date: rowData.log_date,
                evidence_url: evidenceUrl, // Save the public URL returned from the uploadFile function
                evidence_name: file_name,
                ai_extracted_value: rowData.ai_extracted_value,
                log_unit: rowData.log_unit
            })
            .eq('log_id', rowData.log_id);

        if (error) {
            throw error;
        }

        return evidenceUrl
    },

    createSupplierEmail: async (receiver, sender, date_sent, supplierData) => {
        const { data, error } = await supabase
            .from('supplier_emails')
            .insert({ 
                receiver: receiver, 
                sender: sender, 
                date_sent: date_sent, 
                supplier_id: supplierData.id,
            })
            .select();

        if (error) {
            throw error;
        }

        return data[0].id;
    },

    editSupplierEmail: async (emailRowData) => {
        const {data, error} = await supabase
            .from('supplier_emails')
            .update({
                receiver: emailRowData.receiver,
                sender: emailRowData.sender,
                date_sent: emailRowData.date_sent
            })
            .eq('id', emailRowData.id);
        
        if (error) {
            throw error;
        }
    },

    validateData: (data, fields) => {
        const errors = {};
        fields.forEach(field => {
            if (!field.not_required) {
                const value = data[field.id];
                if (!value) {
                    errors[field.id] = `${field.label} is required`;
                } else {
                    switch (field.type) {
                        case 'email':
                            if (!/\S+@\S+\.\S+/.test(value)) {
                                errors[field.id] = `${field.label} is invalid`;
                            }
                            break;
                        case 'date':
                            if (isNaN(Date.parse(value))) {
                                errors[field.id] = `${field.label} is not a valid date`;
                            }
                            break;
                        case 'number':
                            if (isNaN(value)) {
                                errors[field.id] = `${field.label} must be a number`;
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
        });
        return errors;
    },

    addUserPermission: async (newUser) => {
        const { data, error } = await supabase
            .from('user_permissions')
            .insert([newUser])
            .select('*');
        if (error) {
            throw error;
        }
        return data;
    },

    fetchParameterDataSourceData: async (id) =>{
        const { data, error } = await supabase
        .from('parameter_log')
        .select('log_id, value, log_date, evidence_url, evidence_name, ai_extracted_value, log_unit, Method')
        .eq('data_collection_id', id);

        if (error){
            console.error(error);
            return
        }
        console.log("Fetched Dauiyiuuta:", data); 
        return data
    },

    fetchUserDataEntry: async (userId, processId, parameterId, datacollectionid) => {
        const { data, error } = await supabase
            .from('parameter_log')
            .select(`
                *,
                process(process_id, process_name),
                data_collection_points(id)
            `)
            .eq('data_collection_points.id', datacollectionid)
            .eq('process_id', processId)
            .eq('para_id', parameterId);
            
        if (error) {
            throw error;
        }
        
        return data;
    },

    getURLFromS3: (file_name) =>{
          return `https://compliance-document-bucket.s3.amazonaws.com/${file_name}`
    },
    
    createUserDataEntry: async (userId, processId, parameterId, datacollectionid, newEntry) => {
        // Step 2: Upload evidence file if it exists
        let evidenceUrl = '';
        let file_name = '';
        if (newEntry.evidenceFile) {
            evidenceUrl = await generalFunction.uploadFile(newEntry.evidenceFile);
            file_name = `${Date.now()}_${newEntry.evidenceFile.name}`;
        }

        // Upload to S3 here instead
        // const params = {
        //     Bucket: "compliance-document-bucket",
        //     Key: file_name,
        //     Body: newEntry.evidenceFile,
        //   };
        //   try {
        //     const upload = await uploadToS3(newEntry.evidenceFile, "compliance-document-bucket", file_name).promise();
        //     console.log(upload);
        //     alert("File uploaded successfully.");
        //   } catch (error) {
        //     console.error(error);
        //     alert("Error uploading file: " + error.message); // Inform user about the error
        //   }

        // Step 3: Insert into parameter_log with retrieved data_collection_id and evidence URL
        const { data: id, error } = await supabase
            .from('parameter_log')
            .insert([
                {
                    process_id: processId,
                    para_id: parameterId,
                    value: newEntry.value,
                    log_date: newEntry.log_date,
                    data_collection_id: datacollectionid,
                    evidence_url: evidenceUrl, // Save the public URL returned from the uploadFile function
                    evidence_name: file_name,
                    ai_extracted_value: newEntry.ai_extracted_value,
                    log_unit: newEntry.log_unit,
                    Method: newEntry.Method
                }
            ])
            .single()
            .select('log_id');
    
        if (error) {
            throw error;
        }
        const log_id = id.log_id
        return { log_id, evidenceUrl };
    },

    uploadFile: async (file) =>{
        console.log(file, 'file===========>');
        
        const fileName = `${Date.now()}_${file.name}`;

        const { data, error } = await supabase
        .storage
        .from('Evidence')  
        .upload(`test/${fileName}`, file);

        return data.path;
    },

    deleteFile: async (fileName) =>{
        const { data } = await supabase
            .storage
            .from('Evidence')
            .remove([`test/${fileName}`]);

        console.log(data)
    },

    getSignedUrl: async (path) => {
        const { data, error } = await supabase
        .storage
        .from('Evidence')
        .createSignedUrl(path, 86400);  // 24 hours expiry

        if (error) {
            throw error;
        }
        return data;
    },

    createCompany: async (companyData) => {
        const { data, error } = await supabase
            .from('company')
            .insert({ 
                company_id: companyData.company_id, 
                name: companyData.name, 
            })
            .select('id');

        if (error) {
            throw error;
        }

        return data;
    },

    fetch_aggregated_metrics: async () => {
        try {
            const companyid = await generalFunction.getCompanyId();
    
            const { data, error } = await supabase.rpc('fetch_aggregated_metrics', { p_company_id: companyid });
    
            if (error) {
                console.error("Error in fetch_aggregated_metrics RPC:", error);
                return null;
            }
    
            return data;
        } catch (err) {
            console.error("Error in fetch_aggregated_metrics function:", err);
            return null;
        }
    },

    fetchDataCollectionPoints: async(parameter_id, process_id) =>{
        const companyid = await generalFunction.getCompanyId();
        const {data, error} = await supabase.rpc('fetch_dpc_user_access', {p_parameter_id: parameter_id, p_process_id: process_id});
        if (error){
            throw error;
        }
        return data;
    },

    deleteRecord: async ({table, match}) => {
        try {
          const { data, error } = await supabase
            .from(table)
            .delete()
            .match(match);
      
          if (error) {
            throw error;
          }
      
          return data;
        } catch (error) {
          console.error('Error performing delete operation:', error);
          throw error;
        }
    },

    updateRole: async (userId, role = 'NO_ROLE', status = true, accessTill = null) => {
        try {
            const { data, error } = await supabase
                .from('user_permissions')
                .update({
                    role: role,
                    status: status,
                    access_till: accessTill
                })
                .eq('user_id', userId);
            
            if (error) {
                throw error;
            }
            return data;
        } catch (error) {
            console.error("Error updating user permissions:", error);
            return null;
        }
    },
    generateAndSetJWT: async (userId) => {
        try {
            const { data, error } = await supabase.functions.invoke('jwt_generating_function', {
              body: { userId },
            });
        
            if (error) {
              throw error;
            }
        
            if (!data || !data.token) {
              throw new Error('JWT token not received');
            }
        
            const jwtToken = data.token;
        
            // Store the JWT token in a cookie
            const cookies = new Cookies();
            cookies.set('auth-token', jwtToken, { path: '/', secure: true, sameSite: 'strict' });
        
            // Update Supabase client with the new JWT
            updateSupabaseClient(jwtToken);
        
            return jwtToken;
          } catch (error) {
            console.error('Error generating JWT:', error);
            throw error;
          }
    },

    getChatId: async () => {
        let chat_id = localStorage.getItem("chatId");
        if (!chat_id) {
            localStorage.setItem('chatId', uuidv4());
            chat_id = localStorage.getItem("chatId");
        }
        return chat_id;
    },

    fetchIncidentHistory: async(userId)=> {
        const {data, error} = await supabase
        .from('incident_history')
        .select('*')
        .eq('user_id', userId)

        if(error){
            throw error
        }
        
        return data
    }

}