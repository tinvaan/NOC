import csv
import math
import pandas as pd
import numpy as np
import matplotlib.pyplot as pl

R = 6371000                             # Radius of earth in metres

"""
Print the contents of the CSV files
"""
def printCSV(filename):
    print ("Pritning contents of the file gps.csv\n")
    with open(filename, newline='') as csvfile:
        reader = csv.reader(csvfile, delimiter=' ', quotechar='|')
        for row in reader:
            print (', '.join(row))
    print ("\n")


"""
Parse the CSV file and reutrn columns in a data frame
"""
def parseCSV(filename):
    print ("\nParsing " + filename + ", attempting to create a DataFrame")
    return pd.read_csv(filename, names=[0, 1])

"""
Convert a Data Frame to cartesian coordinates
"""
def convertToCartesian(globalLocations):
    print ("\nAttempting to convert global locations to cartesian coordinates")
    cart_x_list = []
    cart_y_list = []
    for index in range(0, len(globalLocations.index)):
        (x, y) = latLngToCartesian(globalLocations[0].iloc[index], globalLocations[1].iloc[index])
        cart_x_list.append(x)
        cart_y_list.append(y)

    print ("List x = ")
    print (cart_x_list)
    print ("List y = ")
    print (cart_y_list)

    globalLocations[0] = cart_x_list
    globalLocations[1] = cart_y_list
    return globalLocations
    #FIXME: I'm useless !
    #writeToCSV(globalLocations)

"""
Write the cartesian coordinates to a CSV file
Regenerates the data frame by parsing from file
"""
def writeToCSV(csvData):
    print ("\nWriting cartesian values to new CSV file")
    csvData.to_csv('cartesian.csv')
    cartesianLocationSet = parseCSV('cartesian.csv')
    return cartesianLocationSet

"""
Convert latitude and longitude to cartesian coordinates
"""
def latLngToCartesian(lat, lng):
    x_cart = R * math.cos(lat) * math.cos(lng)
    y_cart = R * math.cos(lat) * math.sin(lng)
    return {x_cart, y_cart}

"""
Find the slope and offset of the regression line
"""
def lineSlopeAndOffset(locations):
    print ("\nCalculating the slope and line offset")
    cartLocations = convertToCartesian(locations)
    x = cartLocations[0]
    y = cartLocations[1]
    return np.polyfit(x, y, 1)

"""
Plot the regression line on a cartesian plane
"""
def plotRegressionLine(lc):
    '''
    Value returned by numpy.polyfit() is equivalent to the equation
        y = first_val * x + second_val
    Our aim is to plot a regression line for that equation for each
    set of points in the CSV file

    '''
    print ("\nPlotting the regression line")
    #TODO : Do not hardcode the range
    for point in range(-50, 50):
        y = point * lc[0] + lc[1]
        pl.plot(point, y, 'ro')
    pl.show()

"""
The driver class
"""
def main():
    printCSV('gps.csv')
    locationSet = parseCSV('gps.csv')
    lineConstants = lineSlopeAndOffset(locationSet)
    plotRegressionLine(lineConstants)

"""
Begin the control flow
"""
if __name__ == "__main__" : main()
