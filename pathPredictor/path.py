import csv
import math
import pandas as p
import numpy as np
import matplotlib.pyplot as pl

COLUMN_SEPERATOR=''


"""
Print the contents of the CSV files
"""
def printCSV():
    #FIXME
    print ("Reading file gps.csv")
    with open('gps.csv', newline='') as csvfile:
        reader = csv.reader(csvfile, delimiter=' ', quotechar='|')
        for row in reader:
            print (', '.join(row))


"""
Parse the CSV file and reutrn columns in a data frame
"""
def parseCSV():
    #FIXME
    print ("Parsing the CSV to create a DataFrame")
    return pd.DataFrame.from_csv('gps.csv', sep=COLUMN_SEPERATOR, header=None)

"""
Write the cartesian coordinates to a CSV file
"""
def writeCartesianCSV(locationSet):
    with open('gps.csv', 'w') as csvfile:
        fieldNames = ['lat', 'lng']
        writer = csv.DictWriter(csvfile, fieldNames=fieldnames)
        
        writer.writeheader()
        writer.writerow({'lat': locationSet[lat], 'lng': locationSet[lng]})

"""
Convert latitude and longitude to cartesian coordinates
"""
def latLngToCartesian(lat, lng):
    r_earth = 6371000           #radius of earth in metres
    x_cart = r_earth * math.cos(lat) * math.cos(lng)
    y_cart = r_earth * math.cos(lat) * math.sin(lng)
    return {x_cart, y_cart}

"""
Find the slope and offset of the regression line
"""
def regressionPair(lset):
    print ("Parameters m and c of the regression line(y = mx + c) are " + regression)
    (x, y) = latLngToCartesian(lset[lat], lset[lng])
    return np.polyfit(x, y, 1)

"""
Plot the regression line on a cartesian plane
"""
def plotRegressionLine(regVal):
    '''
    Value returned by numpy.polyfit() is equivalent to the equation
        y = first_val * x + second_val
    Our aim is to plot a regression line for that equation for each
    set of points in the CSV file

    '''
    #TODO : Do not hardcode the range
    for point in range(-50.0, 50.0):
        y = point * lineConstants[0] + lineConstants[1]
        pl.plot(point, y)
    pl.show()

"""
The driver class
"""
def main():
    printCSV()
    locationSet = parseCSV()
    lineConstants = regressionPair(locationSet)
    plotRegressionLine(regressionValuePair)

"""
Begin the control flow
"""
if __name__ = "__main__" : main()
