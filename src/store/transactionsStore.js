import { get, writable } from "svelte/store";
import { convertStringToDate } from "../services/utils";


/**
 * Creation of the store 
 * @returns several function to interact with stored data
 */
function createTransactionsStore() {
    const { subscribe, set, update } = writable({});

    /**
     * Get one project with all it data by project ID
     * @param {string} projectId 
     * @returns {Object} project with all data
     */
    function getRemboursementByProject(projectId){
        const transactions = get(transactionsStore);
        return transactions["remboursements"].filter((remboursement) => remboursement["N°Contrat"] == projectId);
    }

    /**
     * Get all remboursements between "beginDate" and "endDate"
     * @param {string} beginDateStr - beginning date of asked data. Format : "DD-MM-YYYY"
     * @param {string} endDateStr - ending date of asked data. Format : "DD-MM-YYYY"
     * @returns {Array<object>} - array contain all remboursement
     */
    function getRemboursementByDate(beginDateStr, endDateStr) {
        const beginDate = convertStringToDate(beginDateStr).getTime();
        const endDate = convertStringToDate(endDateStr).getTime();

        let filtredTransactions = [];
        const transactions = get(transactionsStore);

        if (transactions && transactions["remboursements"]) {
            filtredTransactions = transactions["remboursements"].filter((remboursement) => {
                const remboursementDate = convertStringToDate(remboursement["Date"]).getTime();
                return remboursementDate >= beginDate && remboursementDate <= endDate;
            });
        }
        return filtredTransactions;
    }

    /**
     * Get all projects of month and yeard of "date"
     * @param {string} datestr - month and year of asked data. Format : "DD-MM-YYYY"
     * @returns {Array} - array contain all project of the entered month's date
     */
    function getProjectByMonth(datestr){
        const date = convertStringToDate(datestr);
        const month = date.getMonth();
        const year = date.getFullYear();

        let filtredTransactions = [];
        const transactions = get(transactionsStore);

        if (transactions && transactions["projects"]) {
            filtredTransactions = transactions["projects"].filter((projet) => {
                const projectDate = convertStringToDate(projet["Date de financement"]);
                const dateMonth = projectDate.getMonth();
                const dateYear = projectDate.getFullYear();
                return dateMonth == month && dateYear == year;
            });
        }
        return filtredTransactions;
    }

    /**
     * get the amount of money invested on one month
     * @param {string} date - month and year of asked data. Format : "DD-MM-YY"
     * @returns {Object<String, Number>} key = date, value = money off asked month and year
     */
    function getInvestedMoneyByMonth(date){
        let investedMoney = {};
        let projects = getProjectByMonth(date);
        const totalMoney = projects.reduce((total, project) => {
            return total + project.Montant;
        }, 0); // 0 est la valeur initiale
        investedMoney[date] = totalMoney
        return investedMoney;
    }

    /**
     * Get money invested by month from the begining of investements
     */
    function getInvestedMoneyByMonthFromBeginning(){
        let investedMoney = {};
        const transactions = get(transactionsStore);
        
        if(transactions["projects"]){
            let currentDate = getBeginningDate();
            const todayDate = new Date(); // recupère la date d'aujourd'hui
            todayDate.setDate(1); //  et set le jour à 1
            while (currentDate <= todayDate) {
                let monthdata = getInvestedMoneyByMonth(currentDate.toLocaleDateString());
                investedMoney[Object.keys(monthdata)] = Object.values(monthdata)[0];
                currentDate.setMonth(currentDate.getMonth() + 1); // Passe au mois suivant
            }
            return investedMoney;
        }
    }

    /**
     *  Get the date of the first investement
     * @returns {Date} - Date of the first investissement
     */
    function getBeginningDate(){
        const transactions = get(transactionsStore);
        let dates = transactions["projects"].map(transaction => new Date(convertStringToDate(transaction["Date de financement"])));
        return new Date(Math.min(...dates));
    }



    return {
        subscribe,
        set,
        get,
        update,
        getRemboursementByDate,
        getRemboursementByProject,
        getProjectByMonth,
        getInvestedMoneyByMonth,
        getInvestedMoneyByMonthFromBeginning,
    };
}


export let transactionsStore = createTransactionsStore();

